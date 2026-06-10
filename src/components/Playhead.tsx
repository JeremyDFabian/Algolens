import { motion } from 'framer-motion';

// Shared spring for the playhead and the cells it glides between, so they move in sync.
export const SPRING = { type: 'spring', stiffness: 320, damping: 30 } as const;

// Rendered INSIDE the currently-active cell. Framer Motion glides the single
// element (matched by layoutId) from its old cell to the new one between steps.
export function Playhead() {
  return (
    <motion.span
      layoutId="algolens-playhead"
      className="playhead"
      transition={SPRING}
      aria-hidden="true"
    />
  );
}
