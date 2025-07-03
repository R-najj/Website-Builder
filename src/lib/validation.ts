import { z } from "zod";

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
  );

const sectionPropsSchema = z
  .object({
    id: z.string(),
    title: safeTextSchema.optional(),
    subtitle: safeTextSchema.optional(),
    content: safeTextSchema.optional(),
    buttonText: safeTextSchema.optional(),
    backgroundColor: colorSchema.optional(),
    textColor: colorSchema.optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
  })
  .strict();

const sectionSchema = z
  .object({
    id: z.string().min(1, "Section ID required"),
    type: z.enum(["hero", "footer", "cta"], {
      errorMap: () => ({ message: "Invalid section type" }),
    }),
    order: z.number().int().min(0),
    props: sectionPropsSchema,
  })
  .strict();

// Import data validation
const importDataSchema = z
  .object({
    sections: z.record(z.string(), sectionSchema),
    sectionOrder: z.array(z.string()).max(100, "Too many sections"), // Prevent DoS
  })
  .strict();

// Form field validation
export const validateSectionProps = (props: unknown) => {
  try {
    return sectionPropsSchema.parse(props);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
};

export const validateSection = (section: unknown) => {
  try {
    return sectionSchema.parse(section);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Section validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    throw error;
  }
};

export const validateImportData = (data: unknown) => {
  try {
    return importDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Import validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    throw error;
  }
};

export const isValidJSON = (str: string): boolean => {
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
};

export const validateFileSize = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  return file.size <= maxSize;
};

export const validateFileType = (file: File): boolean => {
  const validMimeTypes = ["application/json", "text/json"];
  const validExtensions = [".json"];

  const mimeTypeValid = validMimeTypes.includes(file.type);
  const extensionValid = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  return mimeTypeValid && extensionValid;
};
