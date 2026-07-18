function StatCard({ label, value, hint }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <h3 className="mt-3 font-display text-3xl font-bold">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

export default StatCard;
