import EventEmitter from "events";
import { TerminalStyle } from "../../types";
import { CommandProcessor } from "../core/CommandProcessor";
import chalk from "chalk";
import figlet from "figlet";

/**
 * Terminal emulator for command-line interface
 * Note: In a browser environment, this would use xterm.js
 * For this implementation, we're using a simplified version for Node.js
 */
export class TerminalEmulator extends EventEmitter {
  private commandProcessor: CommandProcessor;
  private inputBuffer: string = "";
  private commandHistory: string[] = [];
  private historyPosition: number = -1;
  private prompt: string = ">";

  constructor(commandProcessor: CommandProcessor) {
    super();
    this.commandProcessor = commandProcessor;
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
}
