import { z } from "zod";
import {
  SectionProps,
  Section,
  ImportData,
  ValidationResult,
  ColorValue,
  AlignmentValue,
  SectionType,
} from "@/types";

// Base validation for text inputs
const safeTextSchema = z
  .string()
  .max(1000, "Text too long") // Prevent DoS via large strings
  .refine(
    (val) => !/<script|javascript:|data:|vbscript:|on\w+=/i.test(val),
    "Invalid characters detected"
  );

// Color validation schema
const colorSchema = z
  .string()
  .regex(
    /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|black|white|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|transparent)$/,
    "Invalid color format"
  ) as z.ZodType<ColorValue>;

const alignmentSchema = z.enum([
  "left",
  "center",
  "right",
]) as z.ZodType<AlignmentValue>;

const sectionTypeSchema = z.enum([
  "hero",
  "footer",
  "cta",
]) as z.ZodType<SectionType>;

const sectionPropsSchema = z
  .object({
    id: z.string(),
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    content: safeTextSchema.optional(),
    buttonText: safeTextSchema.optional(),
    buttonLink: safeTextSchema.optional(),
    backgroundColor: colorSchema.optional(),
    textColor: colorSchema.optional(),
    image: safeTextSchema.optional(),
    alignment: alignmentSchema.optional(),
  })
  .strict() as z.ZodType<SectionProps>;

const sectionSchema = z
  .object({
    id: z.string().min(1, "Section ID required"),
    type: sectionTypeSchema,
    order: z.number().int().min(0),
    props: sectionPropsSchema,
  })
  .strict() as z.ZodType<Section>;

// Import data validation
const importDataSchema = z
  .object({
    sections: z.record(z.string(), sectionSchema),
    sectionOrder: z.array(z.string()).max(100, "Too many sections"), // Prevent DoS
  })
  .strict() as z.ZodType<ImportData>;

export function validateSectionProps(
  props: Record<string, unknown>
): ValidationResult<SectionProps> {
  try {
    const validatedProps = sectionPropsSchema.parse(props);
    return {
      success: true,
      data: validatedProps,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }
    return {
      success: false,
      error: "Unknown validation error",
    };
  }
}

export function validateSection(
  section: Record<string, unknown>
): ValidationResult<Section> {
  try {
    const validatedSection = sectionSchema.parse(section);
    return {
      success: true,
      data: validatedSection,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Section validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }
    return {
      success: false,
      error: "Unknown section validation error",
    };
  }
}

export function validateImportData(
  data: Record<string, unknown>
): ValidationResult<ImportData> {
  try {
    const validatedData = importDataSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Import validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }
    return {
      success: false,
      error: "Unknown import validation error",
    };
  }
}

export function isValidJSON(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === "object" && parsed !== null) {
      const dangerousKeys = ["__proto__", "constructor", "prototype"];
      const checkObject = (obj: Record<string, unknown>): boolean => {
        for (const key in obj) {
          if (dangerousKeys.includes(key)) return false;
          if (typeof obj[key] === "object" && obj[key] !== null) {
            if (!checkObject(obj[key] as Record<string, unknown>)) return false;
          }
        }
        return true;
      };
      return checkObject(parsed);
    }
    return true;
  } catch {
    return false;
  }
}

// File validation functions
export function validateFileSize(file: File): ValidationResult<File> {
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  if (file.size <= maxSize) {
    return {
      success: true,
      data: file,
    };
  }
  return {
    success: false,
    error: `File size exceeds 10MB limit. Current size: ${Math.round(
      file.size / 1024 / 1024
    )}MB`,
  };
}

export function validateFileType(file: File): ValidationResult<File> {
  const validMimeTypes = ["application/json", "text/json"];
  const validExtensions = [".json"];

  const mimeTypeValid = validMimeTypes.includes(file.type);
  const extensionValid = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (mimeTypeValid && extensionValid) {
    return {
      success: true,
      data: file,
    };
  }

  return {
    success: false,
    error: `Invalid file type. Expected JSON file, got: ${file.type}`,
  };
}

export function safeParseJSON<T = Record<string, unknown>>(
  jsonString: string
): ValidationResult<T> {
  try {
    if (!isValidJSON(jsonString)) {
      return {
        success: false,
        error: "Invalid JSON format or contains dangerous properties",
      };
    }

    const parsed = JSON.parse(jsonString) as T;
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse JSON",
    };
  }
}
