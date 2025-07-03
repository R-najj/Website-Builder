import { VisualSectionProps } from "@/types";

export function CTASection({
  section,
  isSelected,
  onClick,
}: VisualSectionProps) {
  const {
    title = "Ready to Get Started?",
    subtitle = "Join thousands of satisfied customers today",
    buttonText = "Start Free Trial",
    backgroundColor = "#3b82f6",
    textColor = "#ffffff",
    alignment = "center",
  } = section;

  return (
    <div
      className={`
        relative py-16 px-8 cursor-pointer
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
        <h2 className="text-3xl md:text-5xl font-bold mb-4">{title}</h2>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            className="px-8 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {buttonText}
          </button>
          <button
            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-black transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
