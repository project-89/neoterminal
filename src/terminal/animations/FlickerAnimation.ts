import { AnimationType } from "./types";
import { BaseAnimation } from "./BaseAnimation";

/**
 * Flicker animation that simulates CRT monitor flicker and other retro effects
 */
export class FlickerAnimation extends BaseAnimation {
  private element: HTMLElement | null = null;
  private originalStyle: Record<string, string> = {};
  private flickerFrames: number[] = [];
  private flickerIntensity: number = 0.5;
  private flickerColors: string[] = [
    "#00FFFF", // Cyan
    "#00FF41", // Matrix green
    "#FF00FF", // Magenta
    "#FFF100", // Yellow
    "transparent",
  ];

  /**
   * Create a new flicker animation
   */
  constructor() {
    super(AnimationType.FLICKER);
  }

  /**
   * Update the animation state based on progress
   * @param progress Animation progress (0-1)
   * @param iteration Current iteration count
   */
  protected update(progress: number, iteration: number): void {
    if (!this.element) {
      this.initialize();
    }

    if (!this.element) {
      this.stop();
      return;
    }

    // Apply flicker effect based on current progress
    this.applyFlickerEffect(progress);
  }

  /**
   * Initialize the animation
   */
  private initialize(): void {
    // Get or create element
    this.element =
      this.options.container || (document.activeElement as HTMLElement);

    if (!this.element) {
      return;
    }

    // Save original styles
    this.saveOriginalStyles();

    // Set intensity based on options
    this.flickerIntensity = this.options.intensity || 0.5;

    // Generate flicker frames
    this.generateFlickerFrames();

    // Add flicker class
    this.element.classList.add("flicker-animation");
  }

  /**
   * Save original styles to restore later
   */
  private saveOriginalStyles(): void {
    if (!this.element) return;

    const computedStyle = window.getComputedStyle(this.element);

    // Save styles we will modify
    this.originalStyle = {
      opacity: computedStyle.opacity,
      textShadow: computedStyle.textShadow,
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor,
      filter: computedStyle.filter,
      transform: computedStyle.transform,
    };
  }

  /**
   * Generate random frames for the flicker effect
   */
  private generateFlickerFrames(): void {
    const numFrames = Math.floor(10 + this.flickerIntensity * 20);
    this.flickerFrames = [];

    for (let i = 0; i < numFrames; i++) {
      this.flickerFrames.push(Math.random());
    }

    this.flickerFrames.sort();
  }

  /**
   * Apply flicker effect based on current progress
   * @param progress Animation progress (0-1)
   */
  private applyFlickerEffect(progress: number): void {
    if (!this.element) {
      return;
    }

    // Find the current frame
    const frameIndex = this.flickerFrames.findIndex(
      (frame) => progress <= frame
    );

    // Only apply effect at frame transitions and based on intensity
    if (frameIndex >= 0 && Math.random() < this.flickerIntensity) {
      // Determine flicker type based on probability
      const flickerType = Math.random();

      if (flickerType < 0.3) {
        // Opacity flicker
        this.element.style.opacity = (0.3 + Math.random() * 0.7).toString();
      } else if (flickerType < 0.5) {
        // Color/shadow flicker
        this.applyColorFlicker();
      } else if (flickerType < 0.7) {
        // Transform flicker (slight displacement)
        this.applyTransformFlicker();
      } else if (flickerType < 0.9) {
        // Filter flicker (brightness, contrast)
        this.applyFilterFlicker();
      } else {
        // Combined effects
        this.applyCombinedFlicker();
      }

      // Reset after short delay
      setTimeout(() => {
        if (this.element && this.isPlaying) {
          this.resetStyles();
        }
      }, 50 + Math.random() * 150);
    }
  }

  /**
   * Apply color and text shadow flickering
   */
  private applyColorFlicker(): void {
    if (!this.element) return;

    // Random color flicker
    if (Math.random() < 0.3) {
      const color =
        this.flickerColors[
          Math.floor(Math.random() * this.flickerColors.length)
        ];
      this.element.style.color = color;
    }

    // Text shadow flicker
    const shadowColor =
      this.flickerColors[
        Math.floor(Math.random() * (this.flickerColors.length - 1))
      ]; // Exclude transparent
    const shadowBlur = Math.floor(Math.random() * 10) + 1;
    const shadowX = (Math.random() * 6 - 3) * this.flickerIntensity;
    const shadowY = (Math.random() * 6 - 3) * this.flickerIntensity;

    this.element.style.textShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`;
  }

  /**
   * Apply transform flickering (slight displacement)
   */
  private applyTransformFlicker(): void {
    if (!this.element) return;

    // Small random displacement
    const translateX = (Math.random() * 6 - 3) * this.flickerIntensity;
    const translateY = (Math.random() * 6 - 3) * this.flickerIntensity;
    const skewX = (Math.random() * 2 - 1) * this.flickerIntensity;

    this.element.style.transform = `translate(${translateX}px, ${translateY}px) skewX(${skewX}deg)`;
  }

  /**
   * Apply filter flickering (brightness, contrast)
   */
  private applyFilterFlicker(): void {
    if (!this.element) return;

    // Random brightness/contrast changes
    const brightness = 0.7 + Math.random() * 0.6; // 70-130%
    const contrast = 0.8 + Math.random() * 0.4; // 80-120%
    const blur = Math.random() < 0.3 ? `blur(${Math.random() * 2}px)` : "";

    this.element.style.filter = `brightness(${brightness}) contrast(${contrast}) ${blur}`;
  }

  /**
   * Apply combined flickering effects
   */
  private applyCombinedFlicker(): void {
    if (!this.element) return;

    this.applyColorFlicker();
    this.applyTransformFlicker();
    this.applyFilterFlicker();
  }

  /**
   * Reset styles to original values
   */
  private resetStyles(): void {
    if (!this.element) return;

    for (const [property, value] of Object.entries(this.originalStyle)) {
      (this.element.style as any)[property] = value;
    }
  }

  /**
   * Clean up after animation completes
   */
  protected complete(): void {
    if (this.element) {
      // Reset to original styles
      this.resetStyles();

      // Remove flicker class
      this.element.classList.remove("flicker-animation");
    }

    // Reset variables
    this.element = null;
    this.originalStyle = {};
    this.flickerFrames = [];

    // Call parent complete method
    super.complete();
  }
}
