import { VisualSectionProps } from "@/types";

export function HeroSection({
  section,
  isSelected,
  onClick,
}: VisualSectionProps) {
  const {
    title = "Welcome to Our Website",
    subtitle = "Create amazing experiences with our platform",
    buttonText = "Get Started",
    backgroundColor = "#000000",
    textColor = "#ffffff",
    alignment = "center",
  } = section;

  return (
    <div
      className={`
        relative min-h-[400px] flex items-center justify-center p-8 cursor-pointer
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
        ${
          alignment === "left"
            ? "text-left"
            : alignment === "right"
            ? "text-right"
            : "text-center"
        }
      `}
      style={{ backgroundColor, color: textColor }}
      onClick={onClick}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">{subtitle}</p>
        <button
          className="px-8 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
