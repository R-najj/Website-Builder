import { VisualSectionProps } from "@/types";

export function FooterSection({
  section,
  isSelected,
  onClick,
}: VisualSectionProps) {
  const {
    title = "Your Company",
    content = "Building amazing experiences since 2024",
    backgroundColor = "#1f2937",
    textColor = "#ffffff",
  } = section;

  return (
    <div
      className={`
        relative p-8 cursor-pointer
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
      `}
      style={{ backgroundColor, color: textColor }}
      onClick={onClick}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <p className="opacity-80 mb-4">{content}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center opacity-60">
          <p>&copy; 2025 {title}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
