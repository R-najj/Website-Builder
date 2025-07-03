import { Plus } from "lucide-react";
import {
  useCanvasSelectors,
  useCanvasActions,
  useOrderedSections,
} from "@/store/canvasStore";
import { DraggableSection } from "./DraggableSection";
import { useEffect, useRef } from "react";

export function Canvas() {
  const orderedSections = useOrderedSections();
  const selectedSectionId = useCanvasSelectors.useSelectedSectionId();
  const sectionCount = useCanvasSelectors.useSectionCount();
  const { selectSection } = useCanvasActions();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevSectionCount = useRef(sectionCount);

  useEffect(() => {
    if (sectionCount > prevSectionCount.current) {
      const newSection = orderedSections[orderedSections.length - 1];
      if (newSection) {
        const newSectionRef = sectionRefs.current[newSection.id];
        newSectionRef?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
    prevSectionCount.current = sectionCount;
  }, [sectionCount, orderedSections]);

  if (sectionCount === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-md w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
            <Plus size={20} className="text-gray-600 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Start building your website
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
            Add pre-made sections from the left panel to begin creating your
            website.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="min-h-full">
        {orderedSections.map((section, index) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
          >
            <DraggableSection
              index={index}
              section={section}
              isSelected={selectedSectionId === section.id}
              onClick={() => selectSection(section.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
