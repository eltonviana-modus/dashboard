import { SkeletonBlock } from "@/components/Skeleton";

/**
 * Skeleton usado pelos loading.tsx de cada aba enquanto o fetch dos dados do
 * seller está em andamento. Não depende de params/token: é puramente visual,
 * então não corre risco de quebrar caso o Next não repasse params pro loading.
 */
export default function DashboardSkeleton({ sections = 2 }: { sections?: number }) {
  return (
    <div className="min-h-screen bg-surface-2">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-stone-200 bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b border-stone-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-600 text-sm font-bold text-white">
            C
          </div>
          <div className="space-y-1.5">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-2.5 w-14" />
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-9 w-full" />
          ))}
        </nav>
      </aside>
      <div className="pl-60">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-ink-300/40 bg-surface-1 px-8 py-3">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-64" />
          </div>
          <SkeletonBlock className="h-8 w-72" />
        </header>
        <main className="space-y-6 px-8 py-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-64" />
            ))}
          </div>
          {Array.from({ length: sections }).map((_, i) => (
            <SkeletonBlock key={i} className="h-72" />
          ))}
        </main>
      </div>
    </div>
  );
}
