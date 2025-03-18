import EventEmitter from "events";
import { TerminalStyle } from "../../types";
import { CommandProcessor } from "../core/CommandProcessor";
import chalk from "chalk";
import figlet from "figlet";
import { AnimationOptions, AnimationType } from "./animations/types";
import defaultAnimationSystem from "./animations";
import { TerminalRendering } from "./interfaces/TerminalRendering";

/**
 * Terminal emulator for command-line interface
 * Note: In a browser environment, this would use xterm.js
 * For this implementation, we're using a simplified version for Node.js
 */
export class TerminalEmulator
  extends EventEmitter
  implements TerminalRendering
{
  private commandProcessor: CommandProcessor;
  private inputBuffer: string = "";
  private commandHistory: string[] = [];
  private historyPosition: number = -1;
  private prompt: string = ">";
  private animationEnabled: boolean = false;

  constructor(commandProcessor: CommandProcessor) {
    super();
    this.commandProcessor = commandProcessor;

    // Check if we're in a browser environment where animations can be used
    this.animationEnabled =
      typeof window !== "undefined" && typeof document !== "undefined";

    // Set terminal in command processor to enable animation commands
    if (this.commandProcessor.setTerminal) {
      this.commandProcessor.setTerminal(this);
    }
  }

  /**
   * Initialize the terminal
   */
  public async initialize(): Promise<void> {
    this.displayWelcomeScreen();
    this.setupInputHandling();
    this.displayPrompt();
  }

  /**
   * Display welcome screen with ASCII art
   */
  private displayWelcomeScreen(): void {
    const logo = figlet.textSync("NEOTERMINAL", {
      font: "ANSI Shadow",
      horizontalLayout: "fitted",
      verticalLayout: "default",
    });

    console.log(chalk.cyan(logo));
    console.log(
      chalk.yellow(
        ">> SYSTEM v0.1.0 - INITIALIZING...\n" +
          ">> ESTABLISHING SECURE CONNECTION...\n" +
          ">> WELCOME, OPERATIVE.\n"
      )
    );
  }

  /**
   * Set up input handling from stdin
   */
  private setupInputHandling(): void {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key: Buffer) => {
      const str = key.toString();

      // Handle special keys
      if (str === "\u0003") {
        // Ctrl+C
        console.log("^C");
        process.exit();
      } else if (str === "\r") {
        // Enter
        this.processCommand();
      } else if (str === "\u001b[A") {
        // Up arrow
        this.navigateHistory(-1);
      } else if (str === "\u001b[B") {
        // Down arrow
        this.navigateHistory(1);
      } else if (str === "\u001b[C") {
        // Right arrow
        // Not implemented yet
      } else if (str === "\u001b[D") {
        // Left arrow
        // Not implemented yet
      } else if (str === "\u007f") {
        // Backspace
        if (this.inputBuffer.length > 0) {
          this.inputBuffer = this.inputBuffer.slice(0, -1);
          process.stdout.write("\b \b"); // Move back, erase, move back
        }
      } else if (str.charCodeAt(0) >= 32 && str.charCodeAt(0) <= 126) {
        // Printable characters
        this.inputBuffer += str;
        process.stdout.write(str);
      }
    });
  }

  /**
   * Display the command prompt
   */
  public displayPrompt(): void {
    process.stdout.write(`\n${chalk.cyan(this.prompt)} `);
  }

  /**
   * Process the current command in the input buffer
   */
  private async processCommand(): Promise<void> {
    const command = this.inputBuffer.trim();
    console.log(); // New line after command

    this.inputBuffer = "";

    if (command.length > 0) {
      // Add to history
      this.commandHistory.push(command);
      this.historyPosition = this.commandHistory.length;

      // Process command
      try {
        const result = await this.commandProcessor.process(command);

        if (result.output) {
          console.log(result.output);
        }

        if (!result.success && result.error) {
          this.writeError(result.error);
        }

        this.emit("command-executed", { command, result });
      } catch (error) {
        this.writeError(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    this.displayPrompt();
  }

  /**
   * Navigate through command history
   */
  private navigateHistory(direction: number): void {
    const newPosition = this.historyPosition + direction;

    if (newPosition >= 0 && newPosition <= this.commandHistory.length) {
      // Clear current input
      const inputLength = this.inputBuffer.length;
      process.stdout.write(
        "\r" + " ".repeat(this.prompt.length + 1 + inputLength) + "\r"
      );

      // Set new history position
      this.historyPosition = newPosition;

      // Display prompt
      process.stdout.write(`${chalk.cyan(this.prompt)} `);

      if (newPosition < this.commandHistory.length) {
        // Display command from history
        const historyCommand = this.commandHistory[newPosition];
        this.inputBuffer = historyCommand;
        process.stdout.write(historyCommand);
      } else {
        // Clear input buffer at end of history
        this.inputBuffer = "";
      }
    }
  }

  /**
   * Write text to the terminal
   */
  public write(content: string, style?: TerminalStyle): void {
    let output = content;

    if (style) {
      let chalkStyle: any = chalk;

      if (style.foreground) {
        chalkStyle = chalkStyle.hex(style.foreground);
      }

      if (style.background) {
        chalkStyle = chalkStyle.bgHex(style.background);
      }

      if (style.bold) {
        chalkStyle = chalkStyle.bold;
      }

      if (style.italic) {
        chalkStyle = chalkStyle.italic;
      }

      if (style.underline) {
        chalkStyle = chalkStyle.underline;
      }

      output = chalkStyle(content);
    }

    console.log(output);
  }

  /**
   * Write an error message
   */
  public writeError(message: string): void {
    console.log(chalk.red(`ERROR: ${message}`));
  }

  /**
   * Clear the terminal
   */
  public clear(): void {
    console.clear();
  }

  /**
   * Set the prompt text
   */
  public setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  /**
   * Play an animation in the terminal
   * @param type Animation type to play
   * @param options Animation options
   * @returns Promise that resolves when animation completes
   */
  public async playAnimation(
    type: AnimationType,
    options?: AnimationOptions
  ): Promise<void> {
    if (!this.animationEnabled) {
      console.log(`[Animation: ${type}]`);
      return Promise.resolve();
    }

    return defaultAnimationSystem.play(type, options);
  }

  /**
   * Apply a glitch effect to terminal text
   * @param element Target element or selector
   * @param intensity Effect intensity (0-1)
   * @param duration Duration in milliseconds
   */
  public async applyGlitchEffect(
    element: string | HTMLElement,
    intensity: number = 0.5,
    duration: number = 2000
  ): Promise<void> {
    if (!this.animationEnabled) {
      console.log(`[Glitch effect applied]`);
      return Promise.resolve();
    }

    return this.playAnimation(AnimationType.GLITCH, {
      container:
        typeof element === "string"
          ? (document.querySelector(element) as HTMLElement)
          : element,
      duration,
      intensity,
    });
  }

  /**
   * Apply a typing animation to text
   * @param text Text to animate
   * @param options Animation options
   */
  public async typeText(
    text: string,
    options?: AnimationOptions
  ): Promise<void> {
    if (!this.animationEnabled) {
      console.log(text);
      return Promise.resolve();
    }

    const container = document.createElement("div");
    document.body.appendChild(container);

    try {
      return await this.playAnimation(AnimationType.TYPING, {
        container,
        text,
        ...options,
      });
    } finally {
      if (options?.container) {
        // If container was provided in options, don't remove it
        container.remove();
      }
    }
  }

  /**
   * Apply a matrix rain effect
   * @param duration Duration in milliseconds
   * @param container Target container element
   */
  public async playMatrixRain(
    duration: number = 5000,
    container?: HTMLElement
  ): Promise<void> {
    if (!this.animationEnabled) {
      console.log(`[Matrix rain animation played for ${duration}ms]`);
      return Promise.resolve();
    }

    return this.playAnimation(AnimationType.MATRIX_RAIN, {
      duration,
      container,
    });
  }

  /**
   * Apply a flicker effect to terminal elements
   * @param element Target element or selector
   * @param intensity Effect intensity (0-1)
   * @param duration Duration in milliseconds
   */
  public async applyFlickerEffect(
    element: string | HTMLElement,
    intensity: number = 0.5,
    duration: number = 2000
  ): Promise<void> {
    if (!this.animationEnabled) {
      console.log(`[Flicker effect applied]`);
      return Promise.resolve();
    }

    return this.playAnimation(AnimationType.FLICKER, {
      container:
        typeof element === "string"
          ? (document.querySelector(element) as HTMLElement)
          : element,
      duration,
      intensity,
    });
  }

  /**
   * Apply a pulse effect to terminal elements
   * @param element Target element or selector
   * @param color Color for the pulse
   * @param duration Duration in milliseconds
   */
  public async applyPulseEffect(
    element: string | HTMLElement,
    color?: string,
    duration: number = 3000
  ): Promise<void> {
    if (!this.animationEnabled) {
      console.log(`[Pulse effect applied]`);
      return Promise.resolve();
    }

    return this.playAnimation(AnimationType.PULSE, {
      container:
        typeof element === "string"
          ? (document.querySelector(element) as HTMLElement)
          : element,
      duration,
      color,
    });
  }
}
