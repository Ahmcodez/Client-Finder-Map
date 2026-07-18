function LoadingCard() {
  return (
    <div className="glass-panel animate-pulse rounded-[28px] p-5">
      <div className="h-6 w-24 rounded-full bg-white/10" />
      <div className="mt-6 h-8 w-2/3 rounded-2xl bg-white/10" />
      <div className="mt-4 h-5 w-1/2 rounded-xl bg-white/10" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-20 rounded-2xl bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/10" />
      </div>
      <div className="mt-6 h-12 w-36 rounded-2xl bg-white/10" />
    </div>
  );
}

export default LoadingCard;
