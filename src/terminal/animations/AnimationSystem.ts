import { AnimationSystem } from "../interfaces/AnimationSystem";
import { TerminalAnimation } from "../interfaces/TerminalAnimation";
import { AnimationType, AnimationOptions } from "./types";

/**
 * Animation system implementation that manages all animations
 */
export class AnimationSystemImpl implements AnimationSystem {
  private animations = new Map<AnimationType, () => TerminalAnimation>();
  private activeAnimations = new Set<TerminalAnimation>();

  /**
   * Register an animation factory for a specific animation type
   * @param type Animation type to register
   * @param factory Factory function to create the animation
   */
  registerAnimation(
    type: AnimationType,
    factory: () => TerminalAnimation
  ): void {
    this.animations.set(type, factory);
  }

  /**
   * Get an animation instance by type
   * @param type Animation type to retrieve
   * @param options Options for the animation
   * @returns The animation instance
   * @throws Error if animation type is not registered
   */
  getAnimation(
    type: AnimationType,
    options?: AnimationOptions
  ): TerminalAnimation {
    const factory = this.animations.get(type);
    if (!factory) {
      throw new Error(`Animation type ${type} is not registered`);
    }

    const animation = factory();
    if (options) {
      animation.setOptions(options);
    }

    return animation;
  }

  /**
   * Play an animation with the specified options
   * @param type Animation type to play
   * @param options Options for the animation
   * @returns Promise that resolves when the animation completes
   */
  async play(type: AnimationType, options?: AnimationOptions): Promise<void> {
    const animation = this.getAnimation(type, options);
    this.activeAnimations.add(animation);

    try {
      await animation.play();
    } finally {
      this.activeAnimations.delete(animation);
    }
  }

  /**
   * Stop all currently playing animations
   */
  stopAll(): void {
    this.activeAnimations.forEach((animation) => animation.stop());
    this.activeAnimations.clear();
  }

  /**
   * Create a sequence of animations to play in order
   * @param animations Array of animation types and their options
   * @returns Promise that resolves when all animations complete
   */
  async createSequence(
    animations: Array<{
      type: AnimationType;
      options?: AnimationOptions;
    }>
  ): Promise<void> {
    for (const anim of animations) {
      await this.play(anim.type, anim.options);
    }
  }

  /**
   * Get a list of all available animation types
   * @returns Array of available animation types
   */
  getAvailableAnimations(): AnimationType[] {
    return Array.from(this.animations.keys());
  }
}
