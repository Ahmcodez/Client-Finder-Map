import { motion } from 'framer-motion';

function GradientOrb({ className = '' }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default GradientOrb;
