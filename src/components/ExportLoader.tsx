import { Loader2 } from "lucide-react";

export function ExportLoader({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-gray-900" />
        <p className="text-gray-900 text-lg font-medium">
          Exporting your site...
        </p>
      </div>
    </div>
  );
}
