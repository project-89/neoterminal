import { AnimationType, AnimationOptions } from "../animations/types";

/**
 * Interface for terminal animations
 */
export interface TerminalAnimation {
  /**
   * The type of animation
   */
  readonly type: AnimationType;

  /**
   * Whether the animation is currently playing
   */
  readonly isPlaying: boolean;

  /**
   * Whether the animation is currently paused
   */
  readonly isPaused: boolean;

  /**
   * The current options for the animation
   */
  readonly options: AnimationOptions;

  /**
   * Play the animation with the specified options
   * @param options Options for the animation
   * @returns Promise that resolves when the animation completes
   */
  play(options?: AnimationOptions): Promise<void>;

  /**
   * Stop the animation
   */
  stop(): void;

  /**
   * Pause the animation
   */
  pause(): void;

  /**
   * Resume the animation after pausing
   */
  resume(): void;

  /**
   * Set new options for the animation
   * @param options New options to set
   */
  setOptions(options: AnimationOptions): void;
}
