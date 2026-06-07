import { motion } from 'framer-motion';

// Rendered INSIDE the currently-active cell. Framer Motion glides the single
// element (matched by layoutId) from its old cell to the new one between steps.
export function Playhead() {
  return (
    <motion.span
      layoutId="algolens-playhead"
      className="playhead"
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      aria-hidden="true"
    />
  );
}
