function TestimonialCard({ quote, name, role }) {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <p className="text-base leading-7 text-slate-200">"{quote}"</p>
      <div className="mt-6">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-slate-400">{role}</p>
      </div>
    </div>
  );
}

export default TestimonialCard;
