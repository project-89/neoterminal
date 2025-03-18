import { TerminalAnimation } from "../interfaces/TerminalAnimation";
import { AnimationType, AnimationOptions } from "./types";

/**
 * Base animation class implementing common functionality for all animations
 */
export abstract class BaseAnimation implements TerminalAnimation {
  private _isPlaying: boolean = false;
  private _isPaused: boolean = false;
  private _options: AnimationOptions = {
    duration: 1000,
    delay: 0,
    iterations: 1,
  };
  private animationFrame: number | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private pauseStartTime: number = 0;
  private pausedDuration: number = 0;
  private resolvePlay: (() => void) | null = null;

  /**
   * Create a new base animation with the specified type
   * @param type The animation type
   */
  constructor(readonly type: AnimationType) {}

  /**
   * Get whether the animation is playing
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Get whether the animation is paused
   */
  get isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Get the current animation options
   */
  get options(): AnimationOptions {
    return { ...this._options };
  }

  /**
   * Set options for the animation
   * @param options New options to apply
   */
  setOptions(options: AnimationOptions): void {
    this._options = { ...this._options, ...options };
  }

  /**
   * Play the animation with optional new options
   * @param options Animation options to override defaults
   * @returns Promise that resolves when animation completes
   */
  play(options?: AnimationOptions): Promise<void> {
    // Apply new options if provided
    if (options) {
      this.setOptions(options);
    }

    // Return existing promise if already playing
    if (this._isPlaying && !this._isPaused) {
      return new Promise<void>((resolve) => {
        const prevResolve = this.resolvePlay;
        this.resolvePlay = () => {
          if (prevResolve) prevResolve();
          resolve();
        };
      });
    }

    // Resume if paused
    if (this._isPaused) {
      return this.resume();
    }

    // Start new animation
    this._isPlaying = true;
    this._isPaused = false;
    this.startTime = performance.now();
    this.pausedDuration = 0;

    return new Promise<void>((resolve) => {
      this.resolvePlay = resolve;
      this.animate();
    });
  }

  /**
   * Stop the animation
   */
  stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this._isPlaying = false;
    this._isPaused = false;

    // Resolve the play promise
    if (this.resolvePlay) {
      this.resolvePlay();
      this.resolvePlay = null;
    }

    // Complete and cleanup
    this.complete();
  }

  /**
   * Pause the animation
   */
  pause(): void {
    if (!this._isPlaying || this._isPaused) return;

    this._isPaused = true;
    this.pauseStartTime = performance.now();

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Resume the animation after pausing
   */
  resume(): Promise<void> {
    if (!this._isPlaying || !this._isPaused) {
      return this.play();
    }

    this._isPaused = false;
    this.pausedDuration += performance.now() - this.pauseStartTime;
    this.animate();

    return new Promise<void>((resolve) => {
      const prevResolve = this.resolvePlay;
      this.resolvePlay = () => {
        if (prevResolve) prevResolve();
        resolve();
      };
    });
  }

  /**
   * Animation frame handler
   */
  private animate = (): void => {
    if (!this._isPlaying || this._isPaused) {
      return;
    }

    const now = performance.now();
    const elapsed = now - this.startTime - this.pausedDuration;
    const duration = this._options.duration || 1000;
    const iterations = this._options.iterations || 1;
    const infinite = iterations < 0;

    // Calculate current iteration and progress
    const iterationFloat = elapsed / duration;
    const currentIteration = Math.floor(iterationFloat);
    const progress = iterationFloat - currentIteration;

    // Check if animation is complete
    if (!infinite && currentIteration >= iterations) {
      this.update(1, iterations - 1); // Ensure final frame is rendered
      this.stop();
      return;
    }

    // Update animation state
    this.update(progress, currentIteration);

    // Request next frame
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  /**
   * Update animation state - to be implemented by subclasses
   * @param progress Current progress (0-1) within the current iteration
   * @param iteration Current iteration index
   */
  protected abstract update(progress: number, iteration: number): void;

  /**
   * Called when animation is complete - can be overridden by subclasses
   */
  protected complete(): void {
    // Subclasses can implement cleanup logic here
  }
}
