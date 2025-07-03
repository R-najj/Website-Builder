import DOMPurify from "dompurify";
import { SectionProps, ColorValue } from "@/types";

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
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return "";

  const cleaned = DOMPurify.sanitize(input, purifyConfig);

  return cleaned
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
}

/**
 * Sanitize color values to prevent CSS injection
 */
export function sanitizeColor(color: string | undefined | null): ColorValue {
  if (!color) return "#000000";

  // Only allow hex colors and named colors
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const namedColors: ColorValue[] = [
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
    return cleanColor as ColorValue;
  }

  if (namedColors.includes(cleanColor as ColorValue)) {
    return cleanColor as ColorValue;
  }

  return "#000000";
}

/**
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "";

  const cleanUrl = url.trim();

  const allowedProtocols = /^(https?:\/\/|\/|\.\/|#)/i;

  if (!allowedProtocols.test(cleanUrl)) {
    return "";
  }

  return cleanUrl
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "");
}

/**
 * Sanitize all section properties with proper typing
 */
export function sanitizeSectionProps(
  props: Partial<SectionProps>
): Partial<SectionProps> {
  const sanitized: Partial<SectionProps> = { ...props };

  // Sanitize text fields
  if (sanitized.title !== undefined) {
    sanitized.title = sanitizeText(sanitized.title);
  }
  if (sanitized.subtitle !== undefined) {
    sanitized.subtitle = sanitizeText(sanitized.subtitle);
  }
  if (sanitized.content !== undefined) {
    sanitized.content = sanitizeText(sanitized.content);
  }
  if (sanitized.buttonText !== undefined) {
    sanitized.buttonText = sanitizeText(sanitized.buttonText);
  }
  if (sanitized.buttonLink !== undefined) {
    sanitized.buttonLink = sanitizeUrl(sanitized.buttonLink);
  }
  if (sanitized.image !== undefined) {
    sanitized.image = sanitizeUrl(sanitized.image);
  }

  // Sanitize color fields
  if (sanitized.backgroundColor !== undefined) {
    sanitized.backgroundColor = sanitizeColor(sanitized.backgroundColor);
  }
  if (sanitized.textColor !== undefined) {
    sanitized.textColor = sanitizeColor(sanitized.textColor);
  }

  // Validate alignment
  if (sanitized.alignment !== undefined) {
    const validAlignments = ["left", "center", "right"];
    if (!validAlignments.includes(sanitized.alignment)) {
      sanitized.alignment = "center";
    }
  }

  return sanitized;
}

/**
 * Deep sanitize an object recursively
 */
export function deepSanitize<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value) as T[Extract<keyof T, string>];
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key] = deepSanitize(
        value as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeText(item)
          : typeof item === "object" && item !== null
          ? deepSanitize(item as Record<string, unknown>)
          : item
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize file content
 */
export function sanitizeFileContent(content: string): string {
  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, "");

  return cleanContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
}
