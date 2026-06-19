export default function KittensLoading() {
  return (
    <>
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="h-10 w-48 bg-ink-100 rounded-xl mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-80 bg-ink-100 rounded-lg mx-auto animate-pulse" />
      </div>
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-10 w-48 bg-ink-100 rounded-xl mx-auto mb-10 animate-pulse" />
              <div className="grid grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
                    <div className="aspect-[4/5] bg-ink-100 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-1/2 bg-ink-100 rounded animate-pulse mx-auto" />
                      <div className="h-5 w-3/4 bg-ink-100 rounded animate-pulse mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, k) => (
                  <div key={k} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
                    <div className="aspect-[4/5] bg-ink-100 animate-pulse" />
                    <div className="p-5 space-y-2">
                      <div className="h-5 w-2/3 bg-ink-100 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-ink-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
