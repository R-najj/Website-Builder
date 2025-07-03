import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
    </div>
  );
}
