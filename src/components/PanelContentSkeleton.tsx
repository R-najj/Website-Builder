export function PanelContentSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      <div className="h-8 w-3/4 bg-gray-200 rounded mb-6" />
      <div className="h-10 w-full bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-20 w-full bg-gray-200 rounded-lg" />
        <div className="h-20 w-full bg-gray-200 rounded-lg" />
        <div className="h-20 w-full bg-gray-200 rounded-lg" />
        <div className="h-20 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
