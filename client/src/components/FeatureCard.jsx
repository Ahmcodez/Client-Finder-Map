import { motion } from 'framer-motion';

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div whileHover={{ y: -6 }} className="glass-panel rounded-3xl p-6">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/30 to-accent/30 text-accent">
        <Icon size={26} />
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
    </motion.div>
  );
}

export default FeatureCard;
