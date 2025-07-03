````

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
pnpm install
````

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

### Dynamic Imports

I split client-only UI, like the side panels, into their own dynamically-loaded components. This defers loading heavy UI components, improving the initial bundle size and First Contentful Paint.

```ts
const LeftPanel = dynamic(
  () => import("@/components/LeftPanel").then((mod) => mod.LeftPanel),
  {
    loading: () => <PanelContentSkeleton />, // Prevents layout shift
    ssr: false, //  client-side only
  }
);
```

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
const RightPanelContent = React.memo(
  ({ onClose, selectedSection, control, removeSection, duplicateSection }) => {
    /* … */
  }
);
```

A shallow compare skips re-renders when props don't change.

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

### Compound & Renderer Patterns

I split the canvas into Canvas, LeftPanel, RightPanel. Each section type loads via dynamic import:

```ts
const components = {
  hero: dynamic(() => import("./HeroSection").then((mod) => mod.HeroSection)),
  footer: dynamic(() =>
    import("./FooterSection").then((mod) => mod.FooterSection)
  ),
  cta: dynamic(() => import("./CTASection").then((mod) => mod.CTASection)),
};

const SectionRenderer = ({ section }) => {
  const Component = components[section.type];
  return Component ? <Component section={section.props} /> : null;
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

## 5. Security & Persistence

### JSON Export / Import Validation

The builder lets users export and re-import their canvas as JSON. To prevent malicious payloads:

```ts
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 1. File-type & size checks
  if (!validateFileType(file) || !validateFileSize(file)) {
    alert("Invalid file – must be ≤10 MB .json");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const json = e.target?.result as string;

    // 2. Prototype-pollution & JSON sanity check
    if (!isValidJSON(json)) {
      alert("Malformed JSON");
      return;
    }

    // 3. Zod schema validation
    const data = validateImportData(JSON.parse(json));

    // 4. Import sanitized sections
    importSections(data.sectionOrder.map((id) => data.sections[id]));
  };
  reader.readAsText(file);
};
```

### Input Sanitization & XSS Protection

All user-supplied text is run through **DOMPurify** in `src/lib/security.ts`:

```ts
export const sanitizeText = (input: string) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};
```

The store sanitizes every update/addition:

```ts
const sanitizedProps = sanitizeSectionProps(props);
```

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

## 6. UI/UX & Dev Experience

- **Layout-Stable Loading Skeletons**: The initial app load is managed by a `BuilderSkeleton` component that mimics the final UI layout. Dynamic components like the side panels also use dedicated skeleton loaders. This prevents content layout shift (CLS) for a smoother, flicker-free loading experience.
- Auto-Scroll: New sections slide into view with `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Responsive Panels: Overlays on mobile, sidebars on desktop via Tailwind's responsive utilities
- Tree-Shaking & Icon Imports: ES modules and named imports (e.g., `import { X, Trash2, Copy } from 'lucide-react'`) keep bundles tight
- HMR with Turbopack: I run `next dev --turbopack` for near-instant reloads

```

```
