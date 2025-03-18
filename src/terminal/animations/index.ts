// Animation system and base classes
export { AnimationSystemImpl } from "./AnimationSystem";
export { BaseAnimation } from "./BaseAnimation";

// Animation types
export {
  AnimationType,
  type AnimationOptions,
  type EasingFunction,
} from "./types";

// Animation implementations
export { GlitchAnimation } from "./GlitchAnimation";
export { MatrixRainAnimation } from "./MatrixRainAnimation";
export { TypingAnimation } from "./TypingAnimation";
export { FlickerAnimation } from "./FlickerAnimation";
export { PulseAnimation } from "./PulseAnimation";

// Animation system interface
import { AnimationSystem } from "../interfaces/AnimationSystem";
import { AnimationSystemImpl } from "./AnimationSystem";
import { AnimationType } from "./types";
import { GlitchAnimation } from "./GlitchAnimation";
import { MatrixRainAnimation } from "./MatrixRainAnimation";
import { TypingAnimation } from "./TypingAnimation";
import { FlickerAnimation } from "./FlickerAnimation";
import { PulseAnimation } from "./PulseAnimation";

/**
 * Initialize the animation system with all available animations
 * @returns The configured animation system
 */
export function createAnimationSystem(): AnimationSystem {
  const animationSystem = new AnimationSystemImpl();

  // Register all animations
  animationSystem.registerAnimation(
    AnimationType.GLITCH,
    () => new GlitchAnimation()
  );
  animationSystem.registerAnimation(
    AnimationType.MATRIX_RAIN,
    () => new MatrixRainAnimation()
  );
  animationSystem.registerAnimation(
    AnimationType.TYPING,
    () => new TypingAnimation()
  );
  animationSystem.registerAnimation(
    AnimationType.FLICKER,
    () => new FlickerAnimation()
  );
  animationSystem.registerAnimation(
    AnimationType.PULSE,
    () => new PulseAnimation()
  );

  return animationSystem;
}

// Default singleton instance
const defaultAnimationSystem = createAnimationSystem();
export default defaultAnimationSystem;
