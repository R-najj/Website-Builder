import DOMPurify from "dompurify";
import { SectionProps } from "@/types";

const purifyConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

/**
 * Sanitize user input to prevent XSS attacks
 * Removes all HTML tags and dangerous content
 */
export const sanitizeText = (input: string | undefined | null): string => {
  if (!input) return "";

  const cleaned = DOMPurify.sanitize(input, purifyConfig);

  return cleaned
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
};

/**
 * Sanitize color values to prevent CSS injection
 */
export const sanitizeColor = (color: string | undefined | null): string => {
  if (!color) return "#000000";

  // Only allow hex colors and named colors
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const namedColors = [
    "black",
    "white",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "gray",
    "grey",
    "transparent",
  ];

  const cleanColor = color.toLowerCase().trim();

  if (hexPattern.test(cleanColor)) {
    return cleanColor;
  }

  if (namedColors.includes(cleanColor)) {
    return cleanColor;
  }

  return "#000000";
};

/**
 * Sanitize all section properties
 */
export const sanitizeSectionProps = (
  props: Partial<SectionProps>
): Partial<SectionProps> => {
  const sanitized = { ...props };

  if (sanitized.title) sanitized.title = sanitizeText(sanitized.title);
  if (sanitized.subtitle) sanitized.subtitle = sanitizeText(sanitized.subtitle);
  if (sanitized.content) sanitized.content = sanitizeText(sanitized.content);
  if (sanitized.buttonText)
    sanitized.buttonText = sanitizeText(sanitized.buttonText);

  if (sanitized.backgroundColor)
    sanitized.backgroundColor = sanitizeColor(sanitized.backgroundColor);
  if (sanitized.textColor)
    sanitized.textColor = sanitizeColor(sanitized.textColor);

  return sanitized;
};
