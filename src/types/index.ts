export interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  image?: string;
  alignment?: "left" | "center" | "right";
  [key: string]: unknown;
}

export interface Section {
  id: string;
  type: "hero" | "footer" | "cta";
  props: SectionProps;
  order: number;
}

export interface SectionsRecord {
  [sectionId: string]: Section;
}

export interface CanvasSelectors {
  sections: SectionsRecord;
  sectionOrder: string[];
  selectedSectionId: string | null;
  sectionFilter: SectionFilter;
  orderedSections: Section[];
  selectedSection: Section | null;
  sectionCount: number;
}

export interface CanvasActions {
  addSection: (type: Section["type"], props?: Partial<SectionProps>) => void;
  updateSection: (id: string, props: Partial<SectionProps>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  selectSection: (id: string | null) => void;
  setSectionFilter: (filter: SectionFilter) => void;
  reorderSections: (newOrder: string[]) => void;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearAllSections: () => void;
  importSections: (sections: Section[]) => void;
}

export interface CanvasState extends CanvasSelectors, CanvasActions {}

export interface CanvasStoreSelectors {
  useSections: () => SectionsRecord;
  useSectionOrder: () => string[];
  useOrderedSections: () => Section[];
  useSelectedSectionId: () => string | null;
  useSelectedSection: () => Section | null;
  useSectionCount: () => number;
  useSection: (id: string) => Section | undefined;
}

export interface PreMadeSection {
  type: "hero" | "footer" | "cta";
  name: string;
  icon: string;
  description: string;
  defaultProps: Partial<SectionProps>;
}

export type SectionUpdatePayload = {
  id: string;
  props: Partial<SectionProps>;
};

export type SectionReorderPayload = {
  fromIndex: number;
  toIndex: number;
};

export const ItemTypes = {
  SECTION: "section",
};

export type SectionFilter = "all" | "hero" | "footer" | "cta";

export interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SectionFieldValues = {
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  backgroundColor?: string;
  textColor?: string;
};

export interface LeftPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface HeaderProps {
  onOpenRightPanel: () => void;
  onOpenLeftPanel: () => void;
  onImport: () => void;
  onExport: () => void;
}

export interface DraggableSectionProps {
  section: Section;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface DragItem {
  index: number;
  id: string;
  type: string;
}

export interface VisualSectionProps {
  section: SectionProps;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface SectionRendererProps {
  section: Section;
  isSelected?: boolean;
  onClick?: () => void;
}
