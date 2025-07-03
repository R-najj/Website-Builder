import { useMemo } from "react";
import { X, Zap, Target, Layout } from "lucide-react";
import { useSectionFilter, useCanvasActions } from "@/store/canvasStore";
import { preMadeSections } from "@/lib/preMadeSections";
import { LeftPanelProps, SectionProps } from "@/types";
import { SectionFilter } from "./SectionFilter";

const iconMap = {
  Zap,
  Target,
  Layout,
};

const PanelContent = ({
  onClose,
  onAddSection,
  filteredSections,
}: {
  onClose: () => void;
  onAddSection: (
    sectionType: "hero" | "footer" | "cta",
    defaultProps: Partial<SectionProps>
  ) => void;
  filteredSections: typeof preMadeSections;
}) => (
  <>
    <div className="p-4 border-b border-gray-200 flex items-center justify-between h-16">
      <h2 className="text-xl font-semibold text-gray-900">Add Sections</h2>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 rounded-md xl:hidden"
      >
        <X size={20} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-4">
        <SectionFilter />
        <div>
          <div className="space-y-2">
            {filteredSections.map((section) => {
              const IconComponent =
                iconMap[section.icon as keyof typeof iconMap];
              return (
                <button
                  key={section.type}
                  onClick={() =>
                    onAddSection(section.type, section.defaultProps)
                  }
                  className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent size={16} className="text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {section.name}
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredSections.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No sections match the current filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
);

export function LeftPanel({ isOpen, onClose }: LeftPanelProps) {
  const { addSection } = useCanvasActions();
  const currentFilter = useSectionFilter();

  const filteredSections = useMemo(
    () =>
      preMadeSections.filter((section) => {
        if (currentFilter === "all") return true;
        return section.type === currentFilter;
      }),
    [currentFilter]
  );

  return (
    <>
      <div
        className={`
          w-80 bg-white border-r border-gray-200 flex flex-col
          fixed xl:relative inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          xl:translate-x-0
          hidden xl:flex
        `}
      >
        <PanelContent
          onClose={onClose}
          onAddSection={addSection}
          filteredSections={filteredSections}
        />
      </div>

      <div
        className={`
          fixed inset-0 bg-white z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          xl:hidden
        `}
      >
        <PanelContent
          onClose={onClose}
          onAddSection={addSection}
          filteredSections={filteredSections}
        />
      </div>
    </>
  );
}
