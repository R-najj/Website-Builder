import { PreMadeSection } from "@/types";

export const preMadeSections: PreMadeSection[] = [
  {
    type: "hero",
    name: "Hero Section",
    icon: "Zap",
    description: "Eye-catching hero section with title, subtitle, and CTA",
    defaultProps: {
      title: "Welcome to Our Website",
      subtitle: "Create amazing experiences with our platform",
      buttonText: "Get Started",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      alignment: "center",
    },
  },
  {
    type: "cta",
    name: "Call to Action",
    icon: "Target",
    description: "Conversion-focused section with compelling CTA buttons",
    defaultProps: {
      title: "Ready to Get Started?",
      subtitle: "Join thousands of satisfied customers today",
      buttonText: "Start Free Trial",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      alignment: "center",
    },
  },
  {
    type: "footer",
    name: "Footer",
    icon: "Layout",
    description: "Complete footer with links, company info, and social media",
    defaultProps: {
      title: "Your Company",
      content: "Building amazing experiences since 2024",
      backgroundColor: "#1f2937",
      textColor: "#ffffff",
    },
  },
];
