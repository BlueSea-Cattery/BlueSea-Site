export default function CatsLoading() {
  return (
    <>
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="h-10 w-64 bg-ink-100 rounded-xl mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-96 bg-ink-100 rounded-lg mx-auto animate-pulse" />
      </div>
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-24 bg-ink-100 rounded-lg mx-auto mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
                <div className="aspect-[4/5] bg-ink-100 animate-pulse" />
                <div className="p-6 space-y-2">
                  <div className="h-6 w-3/4 bg-ink-100 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-ink-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
