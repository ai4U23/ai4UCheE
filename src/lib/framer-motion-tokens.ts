// Exact motion & surface choreography tokens extracted from Framer MCP
// Project: "Luxurious Three" (bPWSkk20pwfxzXmKGtRh) in AI4U's Workspace.
import type { Transition, Variants } from 'motion/react';

/** Framer appearEffect cubic-bezier: [0.22, 1, 0.36, 1], 0.65s, 60ms cascade stagger */
export const FRAMER_ENTRANCE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const FRAMER_ENTRANCE_TRANSITION: Transition = {
  type: 'tween',
  ease: FRAMER_ENTRANCE_EASE,
  duration: 0.65,
};

export const FRAMER_STAGGER_DELAYS = [0, 0.06, 0.12, 0.18] as const;

export function getFramerStaggerTransition(index: number): Transition {
  const delay = FRAMER_STAGGER_DELAYS[Math.min(index, FRAMER_STAGGER_DELAYS.length - 1)] ?? 0;
  return {
    ...FRAMER_ENTRANCE_TRANSITION,
    delay,
  };
}

/** Framer breakpoint / shared-layout pill spring: stiffness 500, damping 60, mass 1 */
export const FRAMER_LAYOUT_SPRING: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 60,
  mass: 1,
};

/** Framer Sector card hover & Evidence Approval state-flip spring: duration 0.4s, bounce 0.2 */
export const FRAMER_BOUNCE_SPRING: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0.2,
};

/** Framer Swarm Pulse (NgQ5bLGaW -> TSGDAqBQ2): 1.4s mirror loop on 7px status beacon */
export const FRAMER_SWARM_PULSE_TRANSITION: Transition = {
  duration: 1.4,
  repeat: Infinity,
  repeatType: 'mirror',
  ease: [0.42, 0, 0.58, 1],
};

/** Enter-only container & item variants (NO exit prop -> 100% synchronous DOM unmount for Vitest) */
export const FRAMER_STAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 18, scale: 1 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...FRAMER_ENTRANCE_TRANSITION,
      staggerChildren: 0.06,
    },
  },
};

export const FRAMER_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: FRAMER_ENTRANCE_TRANSITION,
  },
};
