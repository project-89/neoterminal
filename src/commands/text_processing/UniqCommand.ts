import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualFile } from "../../filesystem/VirtualNodes";

/**
 * Report or filter out repeated lines
 */
export class UniqCommand implements Command {
  name = "uniq";
  aliases = [];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Report or filter out repeated lines";
  usage = "uniq [options] [input [output]]";
  examples = [
    "uniq file.txt",
    "uniq -c file.txt",
    "uniq -d file.txt",
    "uniq -i file.txt",
  ];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options
    let showCount = false;
    let onlyDuplicates = false;
    let onlyUnique = false;
    let ignoreCase = false;
    const filePaths: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        // Parse each flag
        for (let i = 1; i < arg.length; i++) {
          const flag = arg.charAt(i);
          if (flag === "c") showCount = true;
          else if (flag === "d") onlyDuplicates = true;
          else if (flag === "u") onlyUnique = true;
          else if (flag === "i") ignoreCase = true;
          else {
            return {
              success: false,
              error: `Invalid option: ${flag}`,
            };
          }
        }
      } else {
        // Not an option, must be a file path
        filePaths.push(arg);
      }
    }

    // If no input file is specified, return error
    // In a real terminal, uniq would read from stdin
    if (filePaths.length === 0) {
      return {
        success: false,
        error: "No input file specified",
      };
    }

    // For simplicity, we'll only support reading from input file,
    // not writing to output file
    const inputPath = filePaths[0];

    try {
      const node = filesystem.getNode(inputPath);

      if (!node) {
        return {
          success: false,
          error: `Cannot open '${inputPath}': No such file or directory`,
        };
      }

      if (!(node instanceof VirtualFile)) {
        return {
          success: false,
          error: `'${inputPath}' is not a regular file`,
        };
      }

      // Read file content
      const content = filesystem.readFile(inputPath).toString();
      const lines = content.split("\n");

      const resultLines: string[] = [];
      let count = 1;

      // Process each line
      for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        const nextLine = i < lines.length - 1 ? lines[i + 1] : null;

        // Check if current line matches next line
        const isMatch =
          nextLine !== null && this.isEqual(currentLine, nextLine, ignoreCase);

        if (!isMatch) {
          // Line is different from next line
          let outputLine = currentLine;

          // Apply filters
          const isDuplicate = count > 1;
          const shouldOutput =
            (onlyDuplicates && isDuplicate) ||
            (onlyUnique && !isDuplicate) ||
            (!onlyDuplicates && !onlyUnique);

          if (shouldOutput) {
            if (showCount) {
              outputLine = `${count.toString().padStart(7)} ${currentLine}`;
            }
            resultLines.push(outputLine);
          }

          // Reset count for next unique line
          count = 1;
        } else {
          // Line matches next line, increment count
          count++;
        }
      }

      return {
        success: true,
        output: resultLines.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if two strings are equal, with optional case insensitivity
   */
  private isEqual(a: string, b: string, ignoreCase: boolean): boolean {
    if (ignoreCase) {
      return a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
  }
}
