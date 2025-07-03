"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { saveAs } from "file-saver";
import { Header } from "@/components/Header";
import { Canvas } from "@/components/Canvas";
import { ExportLoader } from "@/components/ExportLoader";
import { useCanvasActions, useCanvasStore } from "@/store/canvasStore";
import {
  validateImportData,
  isValidJSON,
  validateFileSize,
  validateFileType,
} from "@/lib/validation";
import { PanelContentSkeleton } from "./PanelContentSkeleton";

const LeftPanelLoading = () => (
  <div className="w-80 bg-white border-r border-gray-200 flex-col hidden xl:flex">
    <PanelContentSkeleton />
  </div>
);

const RightPanelLoading = () => (
  <div className="w-80 bg-white border-l border-gray-200 flex-col hidden xl:flex">
    <PanelContentSkeleton />
  </div>
);

const LeftPanel = dynamic(
  () => import("@/components/LeftPanel").then((mod) => mod.LeftPanel),
  {
    loading: LeftPanelLoading,
    ssr: false,
  }
);

const RightPanel = dynamic(
  () => import("@/components/RightPanel").then((mod) => mod.RightPanel),
  {
    loading: RightPanelLoading,
    ssr: false,
  }
);

export default function BuilderClient() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file)) {
      alert("Invalid file type. Please select a JSON file.");
      return;
    }
    if (!validateFileSize(file)) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (!isValidJSON(result)) {
          throw new Error("Invalid JSON or malicious content detected.");
        }
        const importedData = JSON.parse(result);
        const validatedData = validateImportData(importedData);
        const sectionsArray = validatedData.sectionOrder.map(
          (id) => validatedData.sections[id]
        );
        importSections(sectionsArray);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Import failed: ${message}`);
      }
    };
    reader.readAsText(file);
  };

  const overlayVisible = leftPanelOpen || rightPanelOpen;

  return (
    <DndProvider backend={HTML5Backend}>
      <ExportLoader active={isExporting} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/json"
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
