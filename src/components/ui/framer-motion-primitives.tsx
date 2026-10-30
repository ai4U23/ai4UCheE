// Reusable Framer "Luxurious Three" motion primitives (< 200 LOC).
// All entrance wrappers are strictly enter-only (zero `exit` prop / zero AnimatePresence hold)
// so Vitest synchronous post-click `queryByTestId(...).toBeNull()` assertions pass with 0ms unmount latency.
import React from 'react';
import { motion } from 'motion/react';
import {
  FRAMER_BOUNCE_SPRING,
  FRAMER_ENTRANCE_TRANSITION,
  FRAMER_LAYOUT_SPRING,
  FRAMER_SWARM_PULSE_TRANSITION,
} from '../../lib/framer-motion-tokens';

export interface FramerEntranceStageProps {
  children: React.ReactNode;
  className?: string;
  testId?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export const FramerEntranceStage: React.FC<FramerEntranceStageProps> = ({
  children,
  className,
  testId,
  delay = 0,
  style,
}) => (
  <motion.div
    className={className}
    data-testid={testId}
    style={style}
    initial={{ opacity: 0, y: 18, scale: 1 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={delay > 0 ? { ...FRAMER_ENTRANCE_TRANSITION, delay } : FRAMER_ENTRANCE_TRANSITION}
  >
    {children}
  </motion.div>
);

export interface SwarmPulseDotProps {
  tone?: 'gold' | 'emerald' | 'danger';
  testId?: string;
}

export const SwarmPulseDot: React.FC<SwarmPulseDotProps> = ({
  tone = 'emerald',
  testId = 'swarm-pulse-dot',
}) => (
  <motion.span
    className={`swarm-pulse-dot swarm-pulse-${tone}`}
    data-testid={testId}
    aria-hidden="true"
    initial={{ opacity: 0.4, scale: 1 }}
    animate={{ opacity: [0.35, 1], scale: [1, 1.25] }}
    transition={FRAMER_SWARM_PULSE_TRANSITION}
  />
);

export interface MotionPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  layoutId: string;
  isActive: boolean;
  testId?: string;
  pillClassName?: string;
}

export const MotionPillButton: React.FC<MotionPillButtonProps> = ({
  layoutId,
  isActive,
  testId,
  className = '',
  pillClassName = 'motion-pill framer-pill-glow',
  children,
  style,
  ...rest
}) => (
  <motion.button
    type="button"
    data-testid={testId}
    className={`framer-pill-btn ${className} ${isActive ? 'active' : ''}`.trim()}
    style={{ position: 'relative', overflow: 'hidden', ...style }}
    whileHover={{ y: -1.5 }}
    whileTap={{ scale: 0.97 }}
    transition={FRAMER_BOUNCE_SPRING}
    {...(rest as React.ComponentProps<typeof motion.button>)}
  >
    {isActive && (
      <motion.span
        layoutId={layoutId}
        className={pillClassName}
        transition={FRAMER_LAYOUT_SPRING}
      />
    )}
    <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
  </motion.button>
);

export interface FramerModalShellProps {
  backdropTestId: string;
  dialogTestId: string;
  ariaLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const FramerModalShell: React.FC<FramerModalShellProps> = ({
  backdropTestId,
  dialogTestId,
  ariaLabel,
  onClose,
  children,
}) => (
  <motion.div
    className="modal-backdrop"
    data-testid={backdropTestId}
    onClick={onClose}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    <motion.div
      className="wb-panel modal-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-testid={dialogTestId}
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={FRAMER_BOUNCE_SPRING}
    >
      {children}
    </motion.div>
  </motion.div>
);
