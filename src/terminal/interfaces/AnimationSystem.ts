import { AnimationType, AnimationOptions } from "../animations/types";
import { TerminalAnimation } from "./TerminalAnimation";

/**
 * Interface for the animation system that manages all animations
 */
export interface AnimationSystem {
  /**
   * Register an animation factory for a specific animation type
   * @param type Animation type to register
   * @param factory Factory function to create the animation
   */
  registerAnimation(
    type: AnimationType,
    factory: () => TerminalAnimation
  ): void;

  /**
   * Get an animation instance by type
   * @param type Animation type to retrieve
   * @param options Options for the animation
   * @returns The animation instance
   */
  getAnimation(
    type: AnimationType,
    options?: AnimationOptions
  ): TerminalAnimation;

  /**
   * Play an animation with the specified options
   * @param type Animation type to play
   * @param options Options for the animation
   * @returns Promise that resolves when the animation completes
   */
  play(type: AnimationType, options?: AnimationOptions): Promise<void>;

  /**
   * Stop all currently playing animations
   */
  stopAll(): void;

  /**
   * Create a sequence of animations to play in order
   * @param animations Array of animation types and their options
   * @returns Promise that resolves when all animations complete
   */
  createSequence(
    animations: Array<{
      type: AnimationType;
      options?: AnimationOptions;
    }>
  ): Promise<void>;

  /**
   * Get a list of all available animation types
   * @returns Array of available animation types
   */
  getAvailableAnimations(): AnimationType[];
}
