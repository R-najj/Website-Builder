import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://website-builder-riad-alnajjars-projects.vercel.app/";

  return [
    {
      url: baseUrl,
    },
  ];
}
