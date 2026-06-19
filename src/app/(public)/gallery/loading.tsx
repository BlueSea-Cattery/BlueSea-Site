export default function GalleryLoading() {
  return (
    <>
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="h-10 w-48 bg-ink-100 rounded-xl mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-64 bg-ink-100 rounded-lg mx-auto animate-pulse" />
      </div>
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-ink-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
