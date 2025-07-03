export type ColorValue =
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
export type AlignmentValue = "left" | "center" | "right";
export type SectionType = "hero" | "footer" | "cta";

export interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  image?: string;
  alignment?: AlignmentValue;
}

export interface Section {
  id: string;
  type: SectionType;
  props: SectionProps;
  order: number;
}

export type SectionPropsMap = {
  hero: Partial<SectionProps>;
  footer: Partial<SectionProps>;
  cta: Partial<SectionProps>;
};

export interface SectionsRecord {
  [sectionId: string]: Section;
}

export interface CanvasSelectors {
  sections: SectionsRecord;
  sectionOrder: string[];
  selectedSectionId: string | null;
  sectionFilter: SectionFilter;
  orderedSections: Section[];
  selectedSection: Section | null;
  sectionCount: number;
}

export interface CanvasActions {
  addSection: <T extends SectionType>(
    type: T,
    props?: SectionPropsMap[T]
  ) => void;
  updateSection: (id: string, props: Partial<SectionProps>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  selectSection: (id: string | null) => void;
  setSectionFilter: (filter: SectionFilter) => void;
  reorderSections: (newOrder: string[]) => void;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearAllSections: () => void;
  importSections: (sections: Section[]) => void;
}

export interface CanvasState extends CanvasSelectors, CanvasActions {}

export interface CanvasStoreSelectors {
  useSections: () => SectionsRecord;
  useSectionOrder: () => string[];
  useOrderedSections: () => Section[];
  useSelectedSectionId: () => string | null;
  useSelectedSection: () => Section | null;
  useSectionCount: () => number;
  useSection: (id: string) => Section | undefined;
}

export interface PreMadeSection<T extends SectionType = SectionType> {
  type: T;
  name: string;
  icon: "Zap" | "Target" | "Layout";
  description: string;
  defaultProps: SectionPropsMap[T];
}

export type SectionUpdatePayload = {
  id: string;
  props: Partial<SectionProps>;
};

export type SectionReorderPayload = {
  fromIndex: number;
  toIndex: number;
};

export const ItemTypes = {
  SECTION: "section",
};

export type ItemType = (typeof ItemTypes)[keyof typeof ItemTypes];

export interface DragItem {
  index: number;
  id: string;
  type: ItemType;
}

export type SectionFilter = "all" | SectionType;

export type SectionFieldValues = {
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
};

export interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface LeftPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface HeaderProps {
  onOpenRightPanel: () => void;
  onOpenLeftPanel: () => void;
  onImport: () => void;
  onExport: () => void;
}

export interface DraggableSectionProps {
  section: Section;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface VisualSectionProps {
  section: SectionProps;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface SectionRendererProps {
  section: Section;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ImportData {
  sections: SectionsRecord;
  sectionOrder: string[];
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class SectionNotFoundError extends Error {
  constructor(id: string) {
    super(`Section with id "${id}" not found`);
    this.name = "SectionNotFoundError";
  }
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export function isHeroSection(section: Section): boolean {
  return section.type === "hero";
}

export function isCTASection(section: Section): boolean {
  return section.type === "cta";
}

export function isFooterSection(section: Section): boolean {
  return section.type === "footer";
}

export function isValidColorValue(value: string): value is ColorValue {
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
  return hexPattern.test(value) || namedColors.includes(value);
}

export function isValidAlignmentValue(value: string): value is AlignmentValue {
  return ["left", "center", "right"].includes(value);
}

// Section validation helpers
export function validateSectionRequiredFields(section: Section): boolean {
  switch (section.type) {
    case "hero":
      return Boolean(section.props.title);
    case "cta":
      return Boolean(section.props.title && section.props.buttonText);
    case "footer":
      return Boolean(section.props.content);
    default:
      return true;
  }
}
