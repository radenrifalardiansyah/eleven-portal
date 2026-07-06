export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-brand-blue/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-blue" />
      </div>
      <p className="text-sm font-medium text-brand-ink/40">Memuat...</p>
    </div>
  );
}
