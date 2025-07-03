"use client";

import { useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { saveAs } from "file-saver";
import { Header } from "@/components/Header";
import { Canvas } from "@/components/Canvas";
import { ExportLoader } from "@/components/ExportLoader";
import { LeftPanel } from "@/components/LeftPanel";
import { RightPanel } from "@/components/RightPanel";
import { useCanvasActions, useCanvasStore } from "@/store/canvasStore";
import {
  validateImportData,
  validateFileSize,
  validateFileType,
  safeParseJSON,
} from "@/lib/validation";

export default function BuilderClient() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { importSections } = useCanvasActions();
  const sections = useCanvasStore((state) => state.sections);
  const sectionOrder = useCanvasStore((state) => state.sectionOrder);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const dataToExport = {
        sections,
        sectionOrder,
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "website-builder-export.json");
      setIsExporting(false);
    }, 1500);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const fileTypeResult = validateFileType(file);
      if (!fileTypeResult.success) {
        throw new Error(
          fileTypeResult.error ||
            "Invalid file type. Please select a JSON file."
        );
      }

      const fileSizeResult = validateFileSize(file);
      if (!fileSizeResult.success) {
        throw new Error(
          fileSizeResult.error || "File too large. Maximum size is 10MB."
        );
      }

      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Failed to read file content"));
          }
        };
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file);
      });

      const parseResult = safeParseJSON(fileContent);
      if (!parseResult.success || !parseResult.data) {
        throw new Error(
          parseResult.error ||
            "Invalid JSON format or malicious content detected."
        );
      }

      const validationResult = validateImportData(parseResult.data);
      if (!validationResult.success || !validationResult.data) {
        throw new Error(
          validationResult.error ||
            "Invalid import data format. Please ensure you're importing a valid website builder export file."
        );
      }

      const validatedData = validationResult.data;

      if (
        !validatedData.sectionOrder ||
        validatedData.sectionOrder.length === 0
      ) {
        throw new Error("No sections found in the import file.");
      }

      const sectionsArray = validatedData.sectionOrder
        .map((id) => validatedData.sections[id])
        .filter(Boolean);

      if (sectionsArray.length === 0) {
        throw new Error("No valid sections found in the import file.");
      }

      importSections(sectionsArray);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error occurred during import";
      alert(`Import failed: ${message}`);
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const overlayVisible = leftPanelOpen || rightPanelOpen;

  return (
    <DndProvider backend={HTML5Backend}>
      <ExportLoader active={isExporting} />
      {isImporting && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-gray-900 text-lg font-medium">
              Importing sections...
            </p>
          </div>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/json,.json"
      />
      <div className="flex h-screen bg-gray-50 relative">
        {overlayVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => {
              setLeftPanelOpen(false);
              setRightPanelOpen(false);
            }}
          />
        )}

        <LeftPanel
          isOpen={leftPanelOpen}
          onClose={() => setLeftPanelOpen(false)}
        />

        <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
          <Header
            onOpenRightPanel={() => setRightPanelOpen(true)}
            onOpenLeftPanel={() => setLeftPanelOpen(true)}
            onImport={handleImportClick}
            onExport={handleExport}
          />
          <Canvas />
        </div>

        <RightPanel
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
        />
      </div>
    </DndProvider>
  );
}
