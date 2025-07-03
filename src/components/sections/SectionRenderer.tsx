import dynamic from "next/dynamic";
import { SectionRendererProps } from "@/types";
import Loader from "@/components/Loader";

const components = {
  hero: dynamic(() => import("./HeroSection").then((mod) => mod.HeroSection), {
    loading: () => <Loader />,
  }),
  footer: dynamic(
    () => import("./FooterSection").then((mod) => mod.FooterSection),
    {
      loading: () => <Loader />,
    }
  ),
  cta: dynamic(() => import("./CTASection").then((mod) => mod.CTASection), {
    loading: () => <Loader />,
  }),
};

export function SectionRenderer({
  section,
  isSelected,
  onClick,
}: SectionRendererProps) {
  const Component = components[section.type];

  if (!Component) {
    return null;
  }

  return (
    <Component
      section={section.props}
      isSelected={isSelected}
      onClick={onClick}
    />
  );
}
