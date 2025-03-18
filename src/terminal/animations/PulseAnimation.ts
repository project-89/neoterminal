import { AnimationType } from "./types";
import { BaseAnimation } from "./BaseAnimation";

/**
 * Pulse animation that creates a breathing/pulsing effect on terminal elements
 */
export class PulseAnimation extends BaseAnimation {
  private element: HTMLElement | null = null;
  private originalStyle: Record<string, string> = {};
  private pulseColors: string[] = [
    "#00FFFF", // Cyan
    "#00FF41", // Matrix green
    "#FF00FF", // Magenta
    "#FFF100", // Yellow
    "#FF6B6B", // Neon red
  ];
  private primaryColor: string = "";
  private secondaryColor: string = "";
  private pulseIntensity: number = 0.5;
  private pulseSize: number = 1.0;

  /**
   * Create a new pulse animation
   */
  constructor() {
    super(AnimationType.PULSE);
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

    // Apply pulse effect based on current progress
    this.applyPulseEffect(progress);
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

    // Set intensity and size based on options
    this.pulseIntensity = this.options.intensity || 0.5;
    this.pulseSize = this.options.scale || 1.0;

    // Select colors for pulsing
    this.selectPulseColors();

    // Add pulse class
    this.element.classList.add("pulse-animation");
  }

  /**
   * Save original styles to restore later
   */
  private saveOriginalStyles(): void {
    if (!this.element) return;

    const computedStyle = window.getComputedStyle(this.element);

    // Save styles we will modify
    this.originalStyle = {
      boxShadow: computedStyle.boxShadow,
      textShadow: computedStyle.textShadow,
      color: computedStyle.color,
      transform: computedStyle.transform,
      filter: computedStyle.filter,
      borderColor: computedStyle.borderColor,
    };
  }

  /**
   * Select colors for the pulse effect
   */
  private selectPulseColors(): void {
    // Use colors from options or pick random ones
    if (this.options.color) {
      this.primaryColor = this.options.color;

      // Find a complementary color for secondary
      const colorIndex = this.pulseColors.indexOf(this.primaryColor);
      if (colorIndex !== -1) {
        const secondaryIndex = (colorIndex + 2) % this.pulseColors.length;
        this.secondaryColor = this.pulseColors[secondaryIndex];
      } else {
        this.secondaryColor =
          this.pulseColors[Math.floor(Math.random() * this.pulseColors.length)];
      }
    } else {
      // Random selection
      const primaryIndex = Math.floor(Math.random() * this.pulseColors.length);
      this.primaryColor = this.pulseColors[primaryIndex];
      const secondaryIndex = (primaryIndex + 2) % this.pulseColors.length;
      this.secondaryColor = this.pulseColors[secondaryIndex];
    }
  }

  /**
   * Apply pulse effect based on current progress
   * @param progress Animation progress (0-1)
   */
  private applyPulseEffect(progress: number): void {
    if (!this.element) {
      return;
    }

    // Use sine wave to create smooth pulsing effect (0-1-0)
    const pulseValue = Math.sin(progress * Math.PI) * this.pulseIntensity;

    // Apply various pulse effects
    this.applyColorPulse(pulseValue);
    this.applySizePulse(pulseValue);
    this.applyGlowPulse(pulseValue);
  }

  /**
   * Apply color pulsing effect
   * @param pulseValue Current pulse value (0-1)
   */
  private applyColorPulse(pulseValue: number): void {
    if (!this.element) return;

    // Only apply color pulse if intensity is sufficient
    if (this.pulseIntensity >= 0.3) {
      // Calculate color mix between primary and secondary
      const colorValue = Math.abs(pulseValue);

      // Apply text color change if configured
      if (!this.options.noColorPulse) {
        this.element.style.color = this.primaryColor;
      }

      // Apply border color change if element has a border
      if (this.options.pulseBorder) {
        this.element.style.borderColor =
          colorValue > 0.5 ? this.primaryColor : this.secondaryColor;
      }
    }
  }

  /**
   * Apply size pulsing effect
   * @param pulseValue Current pulse value (0-1)
   */
  private applySizePulse(pulseValue: number): void {
    if (!this.element || !this.options.sizeChange) return;

    // Calculate scale factor - subtle by default
    const scaleFactor = 1 + pulseValue * 0.1 * this.pulseSize;

    // Apply transform
    this.element.style.transform = `scale(${scaleFactor})`;
  }

  /**
   * Apply glow pulsing effect
   * @param pulseValue Current pulse value (0-1)
   */
  private applyGlowPulse(pulseValue: number): void {
    if (!this.element) return;

    // Calculate glow intensity
    const glowIntensity = Math.abs(pulseValue) * 8 * this.pulseIntensity;
    const glowRadius = Math.max(2, glowIntensity);

    // Apply text shadow for text glow
    this.element.style.textShadow = `0 0 ${glowRadius}px ${this.primaryColor}`;

    // Apply box shadow for element glow
    if (this.options.boxGlow) {
      this.element.style.boxShadow = `0 0 ${glowRadius * 2}px ${glowRadius}px ${
        this.primaryColor
      }`;
    }

    // Apply optional filter effects
    if (this.options.filterEffects) {
      const brightness = 1 + pulseValue * 0.3;
      this.element.style.filter = `brightness(${brightness})`;
    }
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

      // Remove pulse class
      this.element.classList.remove("pulse-animation");
    }

    // Reset variables
    this.element = null;
    this.originalStyle = {};
    this.primaryColor = "";
    this.secondaryColor = "";

    // Call parent complete method
    super.complete();
  }
}
