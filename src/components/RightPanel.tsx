import React, { useEffect, useMemo } from "react";
import { X, Trash2, Copy } from "lucide-react";
import { useSelectedSection, useCanvasActions } from "@/store/canvasStore";
import { useForm, Controller, Control, Path } from "react-hook-form";
import debounce from "lodash.debounce";
import {
  RightPanelProps,
  SectionFieldValues,
  Section as SectionType,
} from "@/types";

const fieldsForType = (
  type: string
): Array<{
  name: Path<SectionFieldValues>;
  label: string;
  input?: "color" | "textarea" | "text";
}> => {
  switch (type) {
    case "footer":
      return [
        { name: "title", label: "Title", input: "text" },
        { name: "content", label: "Content", input: "textarea" },
        {
          name: "backgroundColor",
          label: "Background Color",
          input: "color",
        },
        { name: "textColor", label: "Text Color", input: "color" },
      ];
    case "hero":
    case "cta":
    default:
      return [
        { name: "title", label: "Title", input: "text" },
        { name: "subtitle", label: "Subtitle", input: "text" },
        { name: "buttonText", label: "Button Text", input: "text" },
        {
          name: "backgroundColor",
          label: "Background Color",
          input: "color",
        },
        { name: "textColor", label: "Text Color", input: "color" },
      ];
  }
};

const SectionForm = React.memo(
  ({
    selectedSection,
    control,
    removeSection,
    duplicateSection,
    onClose,
  }: {
    selectedSection: SectionType;
    control: Control<SectionFieldValues>;
    removeSection: () => void;
    duplicateSection: () => void;
    onClose: () => void;
  }) => (
    <form className="p-4 space-y-6">
      {fieldsForType(selectedSection.type).map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            {field.label}
          </label>
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => {
              const commonProps = {
                ...f,
                className:
                  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
              };
              if (field.input === "color") {
                return (
                  <input
                    type="color"
                    {...f}
                    className="w-full h-10 p-0 border border-gray-300 rounded"
                  />
                );
              }
              if (field.input === "textarea") {
                return (
                  <textarea
                    rows={3}
                    {...commonProps}
                    className={`${commonProps.className} resize-none`}
                  />
                );
              }
              return <input {...commonProps} />;
            }}
          />
        </div>
      ))}
      <div className="pt-4 border-t border-gray-200 space-y-2">
        <button
          type="button"
          onClick={duplicateSection}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors"
        >
          <Copy size={18} />
          <span>Duplicate Section</span>
        </button>
        <button
          type="button"
          onClick={() => {
            removeSection();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-md transition-colors"
        >
          <Trash2 size={18} />
          <span>Delete Section</span>
        </button>
      </div>
    </form>
  )
);
SectionForm.displayName = "SectionForm";

const RightPanelForm = ({
  onClose,
  selectedSection,
}: {
  onClose: () => void;
  selectedSection: SectionType | null;
}) => {
  const { updateSection, removeSection, duplicateSection } = useCanvasActions();

  const defaultValues = useMemo(
    () => ({
      title: selectedSection?.props.title ?? "",
      subtitle: selectedSection?.props.subtitle ?? "",
      content: selectedSection?.props.content ?? "",
      buttonText: selectedSection?.props.buttonText ?? "",
      backgroundColor: selectedSection?.props.backgroundColor ?? "#000000",
      textColor: selectedSection?.props.textColor ?? "#ffffff",
    }),
    [selectedSection]
  );

  const { control, watch, reset } = useForm<SectionFieldValues>({
    values: defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const debouncedUpdate = useMemo(
    () =>
      debounce((values: SectionFieldValues) => {
        if (selectedSection) {
          updateSection(selectedSection.id, values);
        }
      }, 300),
    [selectedSection, updateSection]
  );

  useEffect(() => {
    const subscription = watch((values) => {
      debouncedUpdate(values as SectionFieldValues);
    });
    return () => {
      subscription.unsubscribe();
      debouncedUpdate.cancel();
    };
  }, [watch, debouncedUpdate]);

  const handleRemove = useMemo(
    () => () => {
      if (selectedSection) {
        removeSection(selectedSection.id);
      }
    },
    [selectedSection, removeSection]
  );

  const handleDuplicate = useMemo(
    () => () => {
      if (selectedSection) {
        duplicateSection(selectedSection.id);
      }
    },
    [selectedSection, duplicateSection]
  );

  if (!selectedSection) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Select a section to edit its properties.
      </div>
    );
  }

  return (
    <SectionForm
      selectedSection={selectedSection}
      control={control}
      removeSection={handleRemove}
      duplicateSection={handleDuplicate}
      onClose={onClose}
    />
  );
};

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const selectedSection = useSelectedSection();

  const PanelContent = (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between h-16">
        <h2 className="text-xl font-semibold text-gray-900">Inspector</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md xl:hidden"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <RightPanelForm onClose={onClose} selectedSection={selectedSection} />
      </div>
    </>
  );

  return (
    <>
      <div
        className={`w-80 bg-white border-l border-gray-200 flex flex-col fixed xl:relative inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } xl:translate-x-0 hidden xl:flex`}
      >
        {PanelContent}
      </div>

      <div
        className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } xl:hidden`}
      >
        {PanelContent}
      </div>
    </>
  );
}
