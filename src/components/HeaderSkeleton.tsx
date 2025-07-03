import { Menu, Settings } from "lucide-react";

export function HeaderSkeleton() {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between h-16 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-md xl:hidden bg-gray-200">
          <Menu size={20} className="text-gray-400" />
        </div>
        <div className="h-6 w-24 bg-gray-200 rounded-md" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-8 bg-gray-200 rounded-md" />
        <div className="w-10 h-8 bg-gray-200 rounded-md" />
        <div className="w-px h-6 bg-gray-200 mx-2" />
        <div className="w-24 h-9 bg-gray-200 rounded-md" />
        <div className="p-2 rounded-md xl:hidden bg-gray-200">
          <Settings size={20} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
