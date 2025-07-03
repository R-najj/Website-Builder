import Loader from "./Loader";
import { HeaderSkeleton } from "./HeaderSkeleton";

export default function BuilderSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
        <HeaderSkeleton />
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      </div>
    </div>
  );
}
