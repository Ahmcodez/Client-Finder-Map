import { motion } from 'framer-motion';

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl"
    >
      <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base text-slate-400 sm:text-lg">{description}</p> : null}
    </motion.div>
  );
}

export default SectionHeading;
