// import { Filter } from "lucide-react";
import { SectionFilter as SectionFilterType } from "@/types";
import { useSectionFilter, useSetSectionFilter } from "@/store/canvasStore";

const filterOptions: { value: SectionFilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hero", label: "Hero" },
  { value: "footer", label: "Footer" },
  { value: "cta", label: "CTA" },
];

export function SectionFilter() {
  const currentFilter = useSectionFilter();
  const setFilter = useSetSectionFilter();

  return (
    <div className="relative">
      <div className="flex gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1 text-sm rounded-md ${
              currentFilter === option.value
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
