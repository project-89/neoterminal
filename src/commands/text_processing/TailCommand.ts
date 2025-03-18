import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualFile, VirtualNode } from "../../filesystem/VirtualNodes";

/**
 * Display the last part of files
 */
export class TailCommand implements Command {
  name = "tail";
  aliases = [];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Output the last part of files";
  usage = "tail [options] [file...]";
  examples = ["tail file.txt", "tail -n 5 file.txt", "tail -20 file.txt"];
  skillLevel = SkillLevel.OPERATOR;

  // Default number of lines to display
  private defaultLines = 10;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options and file paths
    let lineCount = this.defaultLines;
    const filePaths: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith("-n")) {
        // Handle -n N option
        if (arg.length > 2) {
          // If the number is attached to the -n (e.g., -n5)
          const numStr = arg.substring(2);
          const num = parseInt(numStr);
          if (!isNaN(num) && num > 0) {
            lineCount = num;
          } else {
            return {
              success: false,
              error: `Invalid line count: ${numStr}`,
            };
          }
        } else if (i + 1 < args.length) {
          // If the number is a separate argument (e.g., -n 5)
          const numStr = args[i + 1];
          const num = parseInt(numStr);
          if (!isNaN(num) && num > 0) {
            lineCount = num;
            i++; // Skip the next argument (the number)
          } else {
            return {
              success: false,
              error: `Invalid line count: ${numStr}`,
            };
          }
        } else {
          return {
            success: false,
            error: "Option -n requires a line count",
          };
        }
      } else if (arg.startsWith("-") && arg.length > 1) {
        // Handle -N syntax (e.g., -5)
        const numStr = arg.substring(1);
        const num = parseInt(numStr);
        if (!isNaN(num) && num > 0) {
          lineCount = num;
        } else {
          return {
            success: false,
            error: `Invalid option: ${arg}`,
          };
        }
      } else {
        // Not an option, must be a file path
        filePaths.push(arg);
      }
    }

    // If no files specified, return error
    // In a real terminal, tail would read from stdin
    if (filePaths.length === 0) {
      return {
        success: false,
        error: "No input files specified",
      };
    }

    try {
      let output = "";

      // Process each file
      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const node = filesystem.getNode(filePath);

        if (!node) {
          return {
            success: false,
            error: `Cannot open '${filePath}': No such file or directory`,
          };
        }

        if (!(node instanceof VirtualFile)) {
          return {
            success: false,
            error: `'${filePath}' is not a regular file`,
          };
        }

        // Add file header if multiple files
        if (filePaths.length > 1) {
          if (i > 0) output += "\n";
          output += `==> ${filePath} <==\n`;
        }

        // Read file content and split into lines
        const content = filesystem.readFile(filePath).toString();
        const lines = content.split("\n");

        // Get the last N lines
        const tailLines = lines.slice(Math.max(0, lines.length - lineCount));
        output += tailLines.join("\n");

        // Add newline if we're not at the last file
        if (i < filePaths.length - 1 && tailLines.length > 0) {
          output += "\n";
        }
      }

      return {
        success: true,
        output: output,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
