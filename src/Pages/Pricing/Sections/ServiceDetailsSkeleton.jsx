export default function ServiceDetailsSkeleton() {
  return (
    <div className="relative mx-auto max-w-7xl px-5 py-10 animate-pulse">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <main className="space-y-6 lg:col-span-8">
          {/* ServiceHero Skeleton */}
          <div className="space-y-4 rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 w-24 rounded-full bg-gray-200"></div>
            <div className="h-10 w-3/4 rounded bg-gray-200"></div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-32 rounded bg-gray-200"></div>
              <div className="h-6 w-24 rounded bg-gray-200"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            </div>
            <div className="aspect-[21/9] w-full rounded-3xl bg-gray-200"></div>
          </div>

          {/* FeatureGrid Skeleton */}
          <div className="space-y-4 rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 w-36 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-gray-50 p-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PlanSelector Skeleton */}
          <div className="space-y-4 rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 w-40 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 rounded-3xl border border-gray-50 bg-gray-50/50 p-6">
                  <div className="h-5 w-16 rounded-full bg-gray-200"></div>
                  <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-8 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full rounded bg-gray-200"></div>
                    <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Column (Sidebar) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="h-6 w-1/2 rounded bg-gray-200"></div>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-full">
              <div className="flex-1 h-10 rounded-full bg-gray-200"></div>
              <div className="flex-1 h-10 rounded-full bg-gray-200"></div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="border-t border-gray-100 my-3"></div>
              <div className="flex justify-between">
                <div className="h-6 w-16 rounded bg-gray-200"></div>
                <div className="h-6 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="h-12 w-full rounded-2xl bg-gray-200"></div>
            <div className="h-14 w-full rounded-full bg-gray-200"></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
