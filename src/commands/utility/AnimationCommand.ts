import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { AnimationType } from "../../terminal/animations/types";
import { TerminalRendering } from "../../terminal/interfaces/TerminalRendering";

/**
 * Command to test and showcase various terminal animations
 */
export class AnimationCommand implements Command {
  name = "animation";
  aliases = ["anim"];
  category = CommandCategory.UTILITY;
  description = "Play various terminal animations for cyberpunk aesthetics";
  usage = "animation <type> [options]";
  examples = [
    "animation glitch",
    "animation matrix -d 5000",
    "animation typing -t 'Hello World'",
    "animation pulse -c '#00FFFF' -d 3000",
    "animation flicker -i 0.8",
  ];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    // Manually cast the terminal to TerminalRendering interface
    const terminal = options.terminal as unknown as TerminalRendering;

    if (!terminal) {
      return {
        success: false,
        error: "Animation system is not available",
      };
    }

    if (args.length === 0) {
      return {
        success: false,
        error:
          "Please specify an animation type: glitch, matrix, typing, pulse, flicker",
      };
    }

    const animationType = args[0].toLowerCase();
    const params = this.parseParams(args.slice(1));

    try {
      switch (animationType) {
        case "glitch":
          await terminal.applyGlitchEffect(
            "#terminal-output",
            params.i !== undefined ? parseFloat(params.i) : 0.5,
            params.d !== undefined ? parseInt(params.d) : 2000
          );
          break;

        case "matrix":
          await terminal.playMatrixRain(
            params.d !== undefined ? parseInt(params.d) : 5000
          );
          break;

        case "typing":
          await terminal.typeText(
            params.t || "System initialized. Neural connection established.",
            {
              duration: params.d !== undefined ? parseInt(params.d) : 3000,
              variableSpeed: true,
            }
          );
          break;

        case "pulse":
          await terminal.applyPulseEffect(
            "#terminal-output",
            params.c,
            params.d !== undefined ? parseInt(params.d) : 3000
          );
          break;

        case "flicker":
          await terminal.applyFlickerEffect(
            "#terminal-output",
            params.i !== undefined ? parseFloat(params.i) : 0.5,
            params.d !== undefined ? parseInt(params.d) : 2000
          );
          break;

        default:
          return {
            success: false,
            error: `Unknown animation type: ${animationType}. Available types: glitch, matrix, typing, pulse, flicker`,
          };
      }

      return {
        success: true,
        output: `Animation '${animationType}' completed successfully.`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error playing animation: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Parse command parameters from arguments
   */
  private parseParams(args: string[]): Record<string, string> {
    const params: Record<string, string> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Check if this is a parameter flag
      if (arg.startsWith("-")) {
        const paramName = arg.substring(1);

        // Check if next argument exists and is not a flag
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          params[paramName] = args[i + 1];
          i++; // Skip the next argument as we've already processed it
        } else {
          // Flag without value
          params[paramName] = "true";
        }
      }
    }

    return params;
  }
}
