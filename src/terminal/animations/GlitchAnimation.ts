import { AnimationType } from "./types";
import { BaseAnimation } from "./BaseAnimation";

/**
 * Glitch animation effect for cyberpunk aesthetics
 * Creates visual glitches on text elements
 */
export class GlitchAnimation extends BaseAnimation {
  private element: HTMLElement | null = null;
  private originalContent: string = "";
  private originalClasses: string = "";
  private glitchChars: string = "!<>-_\\/[]{}—=+*^?#________";
  private glitchFrames: Array<number> = [];
  private glitchIntensity: number = 0.5;

  /**
   * Create a new glitch animation
   */
  constructor() {
    super(AnimationType.GLITCH);
  }

  /**
   * Update the animation state based on progress
   * @param progress Animation progress (0-1)
   * @param iteration Current iteration count
   */
  protected update(progress: number, iteration: number): void {
    if (!this.element) {
      this.element =
        this.options.container || (document.activeElement as HTMLElement);

      if (!this.element) {
        this.stop();
        return;
      }

      // Save original content and classes
      this.originalContent = this.element.textContent || "";
      this.originalClasses = this.element.className;

      // Set intensity based on options
      this.glitchIntensity = this.options.intensity || 0.5;

      // Generate random frame timings for glitch effect
      this.generateGlitchFrames();

      // Add glitch class
      this.element.classList.add("glitch-animation");
    }

    // Create glitch effect
    this.applyGlitchEffect(progress);
  }

  /**
   * Generate random frames for the glitch effect
   */
  private generateGlitchFrames(): void {
    // Number of glitch frames is based on intensity
    const numFrames = Math.floor(5 + this.glitchIntensity * 10);
    this.glitchFrames = [];

    // Generate random frames
    for (let i = 0; i < numFrames; i++) {
      this.glitchFrames.push(Math.random());
    }

    // Sort frames
    this.glitchFrames.sort();
  }

  /**
   * Apply glitch effect based on current progress
   * @param progress Animation progress (0-1)
   */
  private applyGlitchEffect(progress: number): void {
    if (!this.element || !this.originalContent) {
      return;
    }

    // Find current frame
    const currentFrameIndex = this.glitchFrames.findIndex(
      (frame) => progress <= frame
    );

    // Apply glitch effect on frame transitions
    if (currentFrameIndex >= 0 && Math.random() < this.glitchIntensity) {
      // Apply text distortion
      this.distortText();

      // Apply CSS effects
      this.applyCssGlitch();

      // Reset after a short delay to create flickering effect
      setTimeout(() => {
        if (this.element && this.isPlaying) {
          this.element.textContent = this.originalContent;
          this.element.className = this.originalClasses;
          this.element.classList.add("glitch-animation");
        }
      }, 50 + Math.random() * 100);
    }
  }

  /**
   * Distort text by replacing characters with random glitch characters
   */
  private distortText(): void {
    if (!this.element || !this.originalContent) {
      return;
    }

    // Only distort some of the text based on intensity
    const distortionAmount = this.glitchIntensity * 0.1;
    let result = "";

    for (let i = 0; i < this.originalContent.length; i++) {
      if (Math.random() < distortionAmount) {
        // Replace with random glitch character
        const randIndex = Math.floor(Math.random() * this.glitchChars.length);
        result += this.glitchChars[randIndex];
      } else {
        result += this.originalContent[i];
      }
    }

    this.element.textContent = result;
  }

  /**
   * Apply CSS glitch effects
   */
  private applyCssGlitch(): void {
    if (!this.element) {
      return;
    }

    // Reset any existing transforms
    this.element.style.transform = "none";

    // Randomly apply some of these effects based on intensity
    if (Math.random() < this.glitchIntensity * 0.5) {
      // Apply color shift
      this.element.style.color = this.getRandomGlitchColor();
      this.element.style.textShadow = `2px 2px ${this.getRandomGlitchColor()}`;
    }

    if (Math.random() < this.glitchIntensity * 0.3) {
      // Apply skew transform
      const skewAmount = (Math.random() * 10 - 5) * this.glitchIntensity;
      this.element.style.transform = `skew(${skewAmount}deg)`;
    }

    if (Math.random() < this.glitchIntensity * 0.3) {
      // Apply position shift
      const shiftX = (Math.random() * 10 - 5) * this.glitchIntensity;
      const shiftY = (Math.random() * 6 - 3) * this.glitchIntensity;
      this.element.style.transform += ` translate(${shiftX}px, ${shiftY}px)`;
    }
  }

  /**
   * Get a random cyberpunk color for glitch effects
   */
  private getRandomGlitchColor(): string {
    const colors = [
      "#FF00FF", // Magenta
      "#00FFFF", // Cyan
      "#00FF00", // Neon green
      "#FF0000", // Red
      "#0000FF", // Blue
      "#FFFF00", // Yellow
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Clean up after animation completes
   */
  protected complete(): void {
    // Reset element to original state
    if (this.element) {
      this.element.textContent = this.originalContent;
      this.element.className = this.originalClasses;
      this.element.style.transform = "none";
      this.element.style.color = "";
      this.element.style.textShadow = "";
    }

    // Reset variables
    this.element = null;
    this.originalContent = "";
    this.originalClasses = "";
    this.glitchFrames = [];

    // Call parent complete method
    super.complete();
  }
}
