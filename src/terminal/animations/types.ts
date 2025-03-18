import { TerminalStyle } from "../../../types";

/**
 * Types of animations that can be displayed in the terminal
 */
export enum AnimationType {
  TYPING = "typing",
  GLITCH = "glitch",
  FADE = "fade",
  PULSE = "pulse",
  FLICKER = "flicker",
  MATRIX_RAIN = "matrix_rain",
  FADE_IN = "fade_in",
  FADE_OUT = "fade_out",
  SCAN_LINE = "scan_line",
  GLITCH_TEXT = "glitchText",
  DIGITAL_NOISE = "digital_noise",
}

/**
 * Function signature for easing functions
 */
export type EasingFunction = (t: number) => number;

/**
 * Animation options for configuring animations
 */
export interface AnimationOptions {
  /**
   * Container element to apply animation to
   */
  container?: HTMLElement;

  /**
   * Duration of the animation in milliseconds
   */
  duration?: number;

  /**
   * Delay before starting animation in milliseconds
   */
  delay?: number;

  /**
   * Number of iterations to run the animation. -1 for infinite.
   */
  iterations?: number;

  /**
   * Easing function to use for the animation
   */
  easing?: EasingFunction;

  /**
   * Text to animate (for text-based animations)
   */
  text?: string;

  /**
   * Style to apply during animation
   */
  style?: TerminalStyle;

  /**
   * Callback when animation completes
   */
  onComplete?: () => void;

  /**
   * Variable speed for typing animations
   */
  variableSpeed?: boolean;

  /**
   * Intensity of the animation effect (0-1)
   */
  intensity?: number;

  /**
   * Scale factor for size-changing animations
   */
  scale?: number;

  /**
   * Custom color to use for the animation
   */
  color?: string;

  /**
   * Disable color pulse effects
   */
  noColorPulse?: boolean;

  /**
   * Enable border color pulsing
   */
  pulseBorder?: boolean;

  /**
   * Enable size change animations
   */
  sizeChange?: boolean;

  /**
   * Enable box shadow glow effects
   */
  boxGlow?: boolean;

  /**
   * Enable filter-based effects (brightness, contrast, etc.)
   */
  filterEffects?: boolean;
}

/**
 * Base interface for all terminal animations
 */
export interface TerminalAnimation {
  type: AnimationType;
  isPlaying: boolean;

  /**
   * Start the animation with the given options
   */
  play(options?: AnimationOptions): Promise<void>;

  /**
   * Stop the currently playing animation
   */
  stop(): void;

  /**
   * Pause the animation at its current state
   */
  pause(): void;

  /**
   * Resume a paused animation
   */
  resume(): void;
}

/**
 * Represents a sequence of animations to be played in order
 */
export interface AnimationSequence {
  animations: Array<{
    type: AnimationType;
    options?: AnimationOptions;
  }>;

  /**
   * Play the sequence of animations
   */
  play(): Promise<void>;

  /**
   * Stop the currently playing sequence
   */
  stop(): void;
}

/**
 * Animation system for rendering animations in the terminal
 */
export interface AnimationSystem {
  /**
   * Register an animation with the system
   */
  registerAnimation(type: AnimationType, animation: TerminalAnimation): void;

  /**
   * Get an animation by type
   */
  getAnimation(type: AnimationType): TerminalAnimation | undefined;

  /**
   * Play an animation with the given options
   */
  play(type: AnimationType, options?: AnimationOptions): Promise<void>;

  /**
   * Stop all currently playing animations
   */
  stopAll(): void;

  /**
   * Create a sequence of animations to be played in order
   */
  createSequence(
    animations: Array<{
      type: AnimationType;
      options?: AnimationOptions;
    }>
  ): AnimationSequence;
}
