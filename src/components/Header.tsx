import { Settings, Menu, Undo, Redo, Download, Upload } from "lucide-react";
import { HeaderProps } from "@/types";
import {
  useCanvasSelectors,
  useIsUndoable,
  useIsRedoable,
  useCanvasActions,
} from "@/store/canvasStore";

export function Header({
  onOpenRightPanel,
  onOpenLeftPanel,
  onImport,
  onExport,
}: HeaderProps) {
  const sectionCount = useCanvasSelectors.useSectionCount();
  const { undo, redo } = useCanvasActions();
  const isUndoable = useIsUndoable();
  const isRedoable = useIsRedoable();

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between h-16">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenLeftPanel}
          className="p-2 hover:bg-gray-100 rounded-md xl:hidden"
        >
          <Menu size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Canvas</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => undo()}
          disabled={!isUndoable}
          className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
          title="Undo"
        >
          <Undo size={18} className="text-gray-700" />
        </button>
        <button
          onClick={() => redo()}
          disabled={!isRedoable}
          className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
          title="Redo"
        >
          <Redo size={18} className="text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2" />
        {sectionCount > 0 ? (
          <button
            onClick={onExport}
            className="px-3 py-1.5 text-sm border border-gray-700 rounded-md hover:bg-gray-50 transition-colors text-gray-900 flex items-center gap-2"
          >
            <Upload size={18} />
            <span className="hidden xl:block">Export</span>
          </button>
        ) : (
          <button
            onClick={onImport}
            className="px-3 py-1.5 text-sm border border-gray-700 rounded-md hover:bg-gray-50 transition-colors text-gray-900 flex items-center gap-2"
          >
            <Download size={18} />
            <span className="hidden xl:block">Import</span>
          </button>
        )}
        <button
          onClick={onOpenRightPanel}
          className="p-2 hover:bg-gray-100 rounded-md xl:hidden"
        >
          <Settings size={20} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
}
