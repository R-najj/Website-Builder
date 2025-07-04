```
## Getting Started
pnpm install
```

```bash
pnpm dev
```

# Technical Architecture & Design Decisions

## 1. State Management

### Zustand with Temporal Middleware

I chose Zustand over Redux to keep my bundle lightweight and TypeScript-friendly. By layering the temporal middleware from zundo, I enabled seamless undo/redo, while subscribeWithSelector gives me fine-grained subscriptions to avoid unnecessary updates.

```ts
const useCanvasStore = create<CanvasState>()(
  temporal(
    subscribeWithSelector(
      devtools((set) => ({
        sections: {},
        sectionOrder: [],
        // …etc
      }))
    )
  )
);
```

### Record-Based Data Model

Sections are stored in a record:

```ts
interface SectionsRecord {
  [id: string]: Section;
}
```

This makes lookups O(1), and I keep a separate `sectionOrder: string[]` for reordering in O(1). It's slightly more complex than a flat array but scales cleanly.

### Focused Hook Pattern

Rather than one big hook, I expose slice-specific hooks for reading state. This ensures components only re-render when the exact data they need changes. Actions are consolidated into a single `useCanvasActions` hook.

```ts
// Example of a selector hook for reading data
export const useSelectedSection = () => {
  const sections = useCanvasStore((state) => state.sections);
  const selectedSectionId = useCanvasStore((state) => state.selectedSectionId);
  return useMemo(() => {
    return selectedSectionId ? sections[selectedSectionId] || null : null;
  }, [sections, selectedSectionId]);
};
```

Each hook subscribes only to exactly what it needs, cutting down on re-renders. I memoize any derived data with `useMemo`.

## 2. Performance Optimizations

### Debounced Form Updates

Form fields trigger updates at most once every 300 ms:

```ts
const debouncedUpdate = React.useMemo(
  () =>
    debounce((values) => {
      if (selectedSection) {
        updateSection(selectedSection.id, values);
      }
    }, 300),
  [selectedSection, updateSection]
);
```

Using Lodash's debounce with cleanup avoids spamming the store during typing.

### Memoized Components

I wrap static children in React.memo:

```ts
const SectionForm = React.memo(
  ({ selectedSection, control, removeSection, duplicateSection, onClose }) => {
    /* … */
  }
);
```

A shallow compare skips re-renders when props don't change.

### Package Import Optimization

Next.js automatically optimizes imports for libraries like Lucide React:

```ts
// next.config.ts
experimental: {
  optimizePackageImports: ["lucide-react"],
}
```

This tree-shakes unused icons and improves bundle size.

## 3. Drag & Drop & Optimistic UI

Using React DnD with the HTML5 backend handles edge cases (accessibility, touch) without reinventing drag logic. During a drag, I optimistically update the order:

```ts
moveSection: (dragIndex, hoverIndex) => {
  const newOrder = [...sectionOrder];
  const [draggedItem] = newOrder.splice(dragIndex, 1);
  newOrder.splice(hoverIndex, 0, draggedItem);
  return { sectionOrder: newOrder };
};
```

This instant feedback feels snappy; the real persistence happens once the user drops.

## 4. Form & Component Patterns

### React Hook Form

I opted for React Hook Form over Formik to keep bundles smaller and leverage uncontrolled inputs. I use the Controller for any custom component, paired with my validation schema.

### Field Configuration System

Fields vary by section type:

```ts
const fieldsForType = (type: string) =>
  type === "hero"
    ? [
        { name: "title", label: "Title", input: "text" },
        { name: "subtitle", label: "Subtitle", input: "text" },
        { name: "buttonText", label: "Button Text", input: "text" },
        { name: "backgroundColor", label: "Background Color", input: "color" },
        { name: "textColor", label: "Text Color", input: "color" },
      ]
    : type === "footer"
    ? [
        { name: "title", label: "Title", input: "text" },
        { name: "content", label: "Content", input: "textarea" },
        { name: "backgroundColor", label: "Background Color", input: "color" },
        { name: "textColor", label: "Text Color", input: "color" },
      ]
    : [];
```

This keeps forms both dynamic and type-safe.

### Section Renderer Pattern

Each section type renders via a dedicated component:

```ts
const SectionRenderer = ({ section }) => {
  switch (section.type) {
    case "hero":
      return <HeroSection {...section.props} />;
    case "footer":
      return <FooterSection {...section.props} />;
    case "cta":
      return <CTASection {...section.props} />;
    default:
      return null;
  }
};
```

### Partial Undo History

I exclude UI-only state from my undo stack:

```ts
temporal(store, {
  partialize: (state) => {
    const { selectedSectionId, sectionFilter, ...rest } = state;
    return rest;
  },
});
```

### Strict TypeScript

With `strict: true` and discriminated unions for sections (hero | footer | cta), I catch errors at compile time and ensure exhaustive handling.

## 5. Security & Validation

### ValidationResult Pattern

All validation functions return a consistent `ValidationResult<T>` type instead of throwing errors:

```ts
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateImportData(
  data: Record<string, unknown>
): ValidationResult<ImportData> {
  try {
    const validatedData = importDataSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    return { success: false, error: "Import validation failed" };
  }
}
```

This pattern provides type-safe error handling without exceptions.

### JSON Import Validation

The builder lets users export and re-import their canvas as JSON. To prevent malicious payloads:

```ts
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 1. File-type & size validation
  const fileTypeResult = validateFileType(file);
  const fileSizeResult = validateFileSize(file);

  if (!fileTypeResult.success || !fileSizeResult.success) {
    throw new Error("Invalid file");
  }

  // 2. Safe JSON parsing with prototype pollution protection
  const parseResult = safeParseJSON(fileContent);
  if (!parseResult.success) {
    throw new Error("Invalid JSON format or malicious content detected");
  }

  // 3. Zod schema validation
  const validationResult = validateImportData(parseResult.data);
  if (!validationResult.success) {
    throw new Error("Invalid import data format");
  }
};
```

### Input Sanitization & XSS Protection

All user-supplied text is run through **DOMPurify** in `src/lib/security.ts`:

```ts
export const sanitizeText = (input: string) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const sanitizeSectionProps = (props: Partial<SectionProps>) => {
  const sanitized = { ...props };

  if (sanitized.title !== undefined) {
    sanitized.title = sanitizeText(sanitized.title);
  }
  if (sanitized.backgroundColor !== undefined) {
    sanitized.backgroundColor = sanitizeColor(sanitized.backgroundColor);
  }
  // ... sanitize all fields

  return sanitized;
};
```

The store sanitizes every update/addition automatically.

### Strong Runtime Types with Zod

`src/lib/validation.ts` defines strict schemas for:

- Section props (`sectionPropsSchema`)
- Individual sections (`sectionSchema`)
- Full import payloads (`importDataSchema`)

Invalid objects are rejected before they reach the store.

### Content-Security-Policy & Security Headers

`next.config.ts` injects headers at build time:

- **CSP** – blocks inline scripts/styles except the minimal ones Next/Tailwind require.
- **X-Frame-Options: DENY** – protects against click-jacking.
- **X-Content-Type-Options: nosniff** and **Referrer-Policy** – harden responses.

These measures dramatically reduce the XSS attack surface while keeping the builder fully client-side.

## 6. SEO & Production Optimizations

### Comprehensive SEO Implementation

The app includes enterprise-level SEO features:

```ts
// Dynamic metadata with fallbacks
export const metadata: Metadata = {
  title: "Website Builder - Create Beautiful Websites with Drag & Drop",
  description:
    "Build stunning websites with our intuitive drag-and-drop website builder...",
  openGraph: {
    title: "Website Builder - Create Beautiful Websites with Drag & Drop",
    description:
      "Build stunning websites with our intuitive drag-and-drop website builder...",
    type: "website",
  },
  // ... Twitter Cards, canonical URLs, etc.
};
```

### Structured Data & Rich Snippets

JSON-LD schema markup for better search engine understanding:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Website Builder",
  "description": "Build stunning websites with our intuitive drag-and-drop website builder...",
  "applicationCategory": "DeveloperApplication",
  "featureList": [
    "Drag and drop interface",
    "Responsive design",
    "Export functionality"
  ]
}
```

### Technical SEO Files

- **`robots.txt`** – Search engine crawling guidelines
- **`sitemap.xml`** – Dynamic XML sitemap generation
- **`manifest.json`** – PWA capabilities and app metadata

### Performance Optimizations

Next.js configuration for production:

```ts
// next.config.ts
const nextConfig = {
  compress: true,
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Static asset caching
  async headers() {
    return [
      {
        source:
          "/(.*)\\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

## 7. UI/UX & Dev Experience

### Responsive Design Strategy

- **Mobile-First**: Panels become full-screen overlays on mobile
- **Progressive Enhancement**: Desktop users get persistent sidebars
- **Adaptive UI**: Import/Export buttons show contextual text based on screen size

### Auto-Scroll & Smooth Interactions

New sections slide into view with `scrollIntoView({ behavior: 'smooth', block: 'center' })` for better UX.

### Loading States & Error Handling

- **Import Loading**: Full-screen loading indicator during file processing
- **Export Animation**: Visual feedback during export generation
- **Comprehensive Error Messages**: User-friendly error handling with detailed feedback

### Tree-Shaking & Icon Imports

ES modules and named imports (e.g., `import { X, Trash2, Copy } from 'lucide-react'`) keep bundles tight.

### HMR with Turbopack

I run `next dev --turbopack` for near-instant reloads during development.

## 8. Type Safety & Developer Experience

### Comprehensive TypeScript Integration

- **Strict Type Checking**: `strict: true` with discriminated unions
- **Custom Type Guards**: Runtime type validation with compile-time safety
- **ValidationResult Pattern**: Consistent error handling across the app

### Template Literal Types

Strong typing for colors and alignment values:

```ts
type ColorValue =
  | `#${string}`
  | "black"
  | "white"
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "orange"
  | "purple"
  | "pink"
  | "brown"
  | "gray"
  | "grey"
  | "transparent";

type AlignmentValue = "left" | "center" | "right";
```

### Generic Store Actions

Type-safe section creation with generics:

```ts
addSection: <T extends SectionType>(
  type: T,
  props: SectionPropsMap[T] = {} as SectionPropsMap[T]
) => {
  // Implementation ensures type safety across section types
};
```
