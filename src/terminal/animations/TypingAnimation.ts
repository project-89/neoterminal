import { AnimationType } from "./types";
import { BaseAnimation } from "./BaseAnimation";

/**
 * Typing animation that simulates text being typed character by character
 */
export class TypingAnimation extends BaseAnimation {
  private element: HTMLElement | null = null;
  private targetText: string = "";
  private currentIndex: number = 0;
  private charsPerUpdate: number = 1;
  private variableSpeed: boolean = true;

  /**
   * Create a new typing animation
   */
  constructor() {
    super(AnimationType.TYPING);
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

    if (!this.element || !this.targetText) {
      this.stop();
      return;
    }

    // Calculate the number of characters to show based on progress
    const targetIndex = Math.min(
      Math.floor(this.targetText.length * progress),
      this.targetText.length
    );

    // If we haven't reached the target index yet, update the display
    if (this.currentIndex < targetIndex) {
      // Adjust the number of chars to type per update for more natural typing
      if (this.variableSpeed) {
        // Punctuation and spaces cause brief pauses
        const nextChar = this.targetText.charAt(this.currentIndex);
        if ([".", ",", "!", "?", ";", ":"].includes(nextChar)) {
          this.charsPerUpdate = 1;
        } else if (nextChar === " ") {
          this.charsPerUpdate = Math.random() < 0.7 ? 1 : 2;
        } else {
          // Random typing speed (1-3 chars per update)
          this.charsPerUpdate = Math.floor(Math.random() * 3) + 1;
        }
      }

      // Update the current index
      this.currentIndex = Math.min(
        this.currentIndex + this.charsPerUpdate,
        targetIndex
      );

      // Update the element content
      this.element.textContent = this.targetText.substring(
        0,
        this.currentIndex
      );

      // Add blinking cursor at the end
      if (progress < 1) {
        const cursorChar = Math.floor(Date.now() / 500) % 2 === 0 ? "█" : " ";
        this.element.textContent += cursorChar;
      }
    }
  }

  /**
   * Initialize the animation
   */
  private initialize(): void {
    // Get or create element
    this.element = this.options.container || document.createElement("div");

    if (!this.element.parentNode && !this.options.container) {
      document.body.appendChild(this.element);
    }

    // Get text to type
    this.targetText = this.options.text || "";

    // Reset index
    this.currentIndex = 0;

    // Set variable speed based on options (default true)
    this.variableSpeed = this.options.variableSpeed !== false;

    // Clear element
    this.element.textContent = "";

    // Add typing animation class
    this.element.classList.add("typing-animation");

    // Apply style from options
    if (this.options.style) {
      if (this.options.style.foreground) {
        this.element.style.color = this.options.style.foreground;
      }

      if (this.options.style.background) {
        this.element.style.backgroundColor = this.options.style.background;
      }

      if (this.options.style.bold) {
        this.element.style.fontWeight = "bold";
      }

      if (this.options.style.italic) {
        this.element.style.fontStyle = "italic";
      }

      if (this.options.style.underline) {
        this.element.style.textDecoration = "underline";
      }
    }
  }

  /**
   * Clean up after animation completes
   */
  protected complete(): void {
    if (this.element) {
      // Set the full text
      this.element.textContent = this.targetText;

      // Remove typing animation class
      this.element.classList.remove("typing-animation");

      // Remove element if we created it
      if (!this.options.container && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }

    // Reset variables
    this.element = null;
    this.targetText = "";
    this.currentIndex = 0;

    // Call parent complete method
    super.complete();
  }
}
