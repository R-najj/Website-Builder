import { create, useStore } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { temporal, TemporalState } from "zundo";
import {
  Section,
  SectionProps,
  CanvasState,
  SectionsRecord,
  SectionFilter,
} from "@/types";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { sanitizeSectionProps } from "@/lib/security";
import { validateSection } from "@/lib/validation";

const generateId = () => `section_${nanoid()}`;

export const useCanvasStore = create<CanvasState>()(
  temporal(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          sections: {} as SectionsRecord,
          sectionOrder: [],
          selectedSectionId: null,
          sectionFilter: "all" as SectionFilter,

          addSection: (type, props = {}) => {
            const id = generateId();
            const sanitizedProps = sanitizeSectionProps(props);
            const newSection: Section = {
              id,
              type,
              props: {
                id,
                ...sanitizedProps,
              },
              order: get().sectionOrder.length,
            };

            set(
              (state) => ({
                sections: {
                  ...state.sections,
                  [id]: newSection,
                },
                sectionOrder: [...state.sectionOrder, id],
                selectedSectionId: id,
              }),
              false,
              "addSection"
            );
          },

          updateSection: (id, props) => {
            const sanitizedProps = sanitizeSectionProps(props);
            set(
              (state) => {
                const section = state.sections[id];
                if (!section) return state;

                return {
                  sections: {
                    ...state.sections,
                    [id]: {
                      ...section,
                      props: { ...section.props, ...sanitizedProps },
                    },
                  },
                };
              },
              false,
              "updateSection"
            );
          },

          removeSection: (id) => {
            set(
              (state) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: _removed, ...remainingSections } = state.sections;
                const newSectionOrder = state.sectionOrder.filter(
                  (sectionId) => sectionId !== id
                );

                return {
                  sections: remainingSections,
                  sectionOrder: newSectionOrder,
                  selectedSectionId:
                    state.selectedSectionId === id
                      ? null
                      : state.selectedSectionId,
                };
              },
              false,
              "removeSection"
            );
          },

          duplicateSection: (id) => {
            const section = get().sections[id];
            if (!section) return;

            const newId = generateId();
            const duplicatedSection: Section = {
              ...section,
              id: newId,
              props: {
                ...section.props,
                id: newId,
                title: section.props.title,
              },
              order: get().sectionOrder.length,
            };

            set(
              (state) => ({
                sections: {
                  ...state.sections,
                  [newId]: duplicatedSection,
                },
                sectionOrder: [...state.sectionOrder, newId],
                selectedSectionId: newId,
              }),
              false,
              "duplicateSection"
            );
          },

          selectSection: (id) => {
            set({ selectedSectionId: id }, false, "selectSection");
          },

          setSectionFilter: (filter) => {
            set({ sectionFilter: filter }, false, "setSectionFilter");
          },

          reorderSections: (newOrder) => {
            set(
              (state) => {
                const updatedSections = { ...state.sections };
                newOrder.forEach((id, index) => {
                  if (updatedSections[id]) {
                    updatedSections[id] = {
                      ...updatedSections[id],
                      order: index,
                    };
                  }
                });

                return {
                  sections: updatedSections,
                  sectionOrder: newOrder,
                };
              },
              false,
              "reorderSections"
            );
          },

          moveSection: (dragIndex: number, hoverIndex: number) => {
            set(
              (state) => {
                const newOrder = [...state.sectionOrder];
                const [draggedItem] = newOrder.splice(dragIndex, 1);
                newOrder.splice(hoverIndex, 0, draggedItem);
                return { sectionOrder: newOrder };
              },
              false,
              "moveSection"
            );
          },

          moveSectionUp: (id) => {
            const { sectionOrder } = get();
            const currentIndex = sectionOrder.indexOf(id);
            if (currentIndex <= 0) return;

            const newOrder = [...sectionOrder];
            [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
              newOrder[currentIndex],
              newOrder[currentIndex - 1],
            ];

            get().reorderSections(newOrder);
          },

          moveSectionDown: (id) => {
            const { sectionOrder } = get();
            const currentIndex = sectionOrder.indexOf(id);
            if (currentIndex >= sectionOrder.length - 1) return;

            const newOrder = [...sectionOrder];
            [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
              newOrder[currentIndex + 1],
              newOrder[currentIndex],
            ];

            get().reorderSections(newOrder);
          },

          clearAllSections: () => {
            set(
              {
                sections: {},
                sectionOrder: [],
                selectedSectionId: null,
              },
              false,
              "clearAllSections"
            );
          },

          importSections: (sectionsArray) => {
            const sections: SectionsRecord = {};
            const sectionOrder: string[] = [];

            sectionsArray.forEach((section, index) => {
              try {
                const validatedSection = validateSection(section);
                const sanitizedProps = sanitizeSectionProps(
                  validatedSection.props
                );

                const id = validatedSection.id || generateId();
                sections[id] = {
                  ...validatedSection,
                  id,
                  order: index,
                  props: sanitizedProps as SectionProps,
                };
                sectionOrder.push(id);
              } catch (error) {
                console.warn(
                  `Skipping invalid section at index ${index}:`,
                  error
                );
              }
            });

            set(
              {
                sections,
                sectionOrder,
                selectedSectionId: null,
              },
              false,
              "importSections"
            );
          },
        }),
        {
          name: "canvas-store",
        }
      )
    ),
    {
      partialize: (state) => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          selectedSectionId: _selectedSectionId,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          sectionFilter: _sectionFilter,
          ...rest
        } = state;
        return rest;
      },
    }
  )
);

export const useTemporalStore = <T>(
  selector: (state: TemporalState<Partial<CanvasState>>) => T
) => {
  return useStore(useCanvasStore.temporal, selector);
};

export const useUndo = () => useTemporalStore((state) => state.undo);
export const useRedo = () => useTemporalStore((state) => state.redo);

export const useIsUndoable = () =>
  useTemporalStore((state) => state.pastStates.length > 0);
export const useIsRedoable = () =>
  useTemporalStore((state) => state.futureStates.length > 0);

export const useSectionFilter = () =>
  useCanvasStore((state) => state.sectionFilter);
export const useSetSectionFilter = () =>
  useCanvasStore((state) => state.setSectionFilter);

export const useCanvasSelectors = {
  useSections: () => useCanvasStore((state) => state.sections),
  useSectionOrder: () => useCanvasStore((state) => state.sectionOrder),
  useSelectedSectionId: () =>
    useCanvasStore((state) => state.selectedSectionId),
  useSectionCount: () => useCanvasStore((state) => state.sectionOrder.length),
  useSection: (id: string) => useCanvasStore((state) => state.sections[id]),
};

export const useOrderedSections = () => {
  const sections = useCanvasStore((state) => state.sections);
  const sectionOrder = useCanvasStore((state) => state.sectionOrder);

  return useMemo(() => {
    return sectionOrder.map((id) => sections[id]).filter(Boolean);
  }, [sections, sectionOrder]);
};

export const useSelectedSection = () => {
  const sections = useCanvasStore((state) => state.sections);
  const selectedSectionId = useCanvasStore((state) => state.selectedSectionId);

  return useMemo(() => {
    return selectedSectionId ? sections[selectedSectionId] || null : null;
  }, [sections, selectedSectionId]);
};

export const useCanvasActions = () => {
  const store = useCanvasStore();
  const { undo, redo } = useCanvasStore.temporal.getState();

  return useMemo(
    () => ({
      addSection: store.addSection,
      updateSection: store.updateSection,
      removeSection: store.removeSection,
      duplicateSection: store.duplicateSection,
      selectSection: store.selectSection,
      reorderSections: store.reorderSections,
      moveSection: store.moveSection,
      moveSectionUp: store.moveSectionUp,
      moveSectionDown: store.moveSectionDown,
      clearAllSections: store.clearAllSections,
      importSections: store.importSections,
      setSectionFilter: store.setSectionFilter,
      undo,
      redo,
    }),
    [store, undo, redo]
  );
};
