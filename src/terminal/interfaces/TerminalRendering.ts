import { TerminalStyle } from "../../../types";
import { AnimationType, AnimationOptions } from "../animations/types";

/**
 * Interface for terminal visual rendering capabilities
 */
export interface TerminalRendering {
  /**
   * Write text to the terminal
   * @param content Content to write
   * @param style Optional styling to apply
   */
  write(content: string, style?: TerminalStyle): void;

  /**
   * Write error message to the terminal
   * @param message Error message to display
   */
  writeError(message: string): void;

  /**
   * Clear the terminal screen
   */
  clear(): void;

  /**
   * Display the command prompt
   */
  displayPrompt(): void;

  /**
   * Play an animation in the terminal
   * @param type Animation type to play
   * @param options Animation options
   * @returns Promise that resolves when animation completes
   */
  playAnimation(type: AnimationType, options?: AnimationOptions): Promise<void>;

  /**
   * Apply a glitch effect to terminal text
   * @param element Target element or selector
   * @param intensity Effect intensity (0-1)
   * @param duration Duration in milliseconds
   */
  applyGlitchEffect(
    element: string | HTMLElement,
    intensity?: number,
    duration?: number
  ): Promise<void>;

  /**
   * Apply a typing animation to text
   * @param text Text to animate
   * @param options Animation options
   */
  typeText(text: string, options?: AnimationOptions): Promise<void>;

  /**
   * Apply a matrix rain effect
   * @param duration Duration in milliseconds
   * @param container Target container element
   */
  playMatrixRain(duration?: number, container?: HTMLElement): Promise<void>;

  /**
   * Apply a flicker effect to terminal elements
   * @param element Target element or selector
   * @param intensity Effect intensity (0-1)
   * @param duration Duration in milliseconds
   */
  applyFlickerEffect(
    element: string | HTMLElement,
    intensity?: number,
    duration?: number
  ): Promise<void>;

  /**
   * Apply a pulse effect to terminal elements
   * @param element Target element or selector
   * @param color Color for the pulse
   * @param duration Duration in milliseconds
   */
  applyPulseEffect(
    element: string | HTMLElement,
    color?: string,
    duration?: number
  ): Promise<void>;
}
