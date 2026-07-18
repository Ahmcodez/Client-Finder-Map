function EmptyState({ title, description }) {
  return (
    <div className="glass-panel rounded-[28px] p-10 text-center">
      <h3 className="font-display text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-slate-400">{description}</p>
    </div>
  );
}

export default EmptyState;
