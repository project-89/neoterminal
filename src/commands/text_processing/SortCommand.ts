import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualFile } from "../../filesystem/VirtualNodes";

/**
 * Sort command for sorting lines of text files
 */
export class SortCommand implements Command {
  name = "sort";
  aliases = [];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Sort lines of text files";
  usage = "sort [options] [file...]";
  examples = ["sort file.txt", "sort -r file.txt", "sort -n numbers.txt"];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options
    let reverse = false;
    let numeric = false;
    let ignoreCase = false;
    let files: string[] = [];

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith("-")) {
        // Handle option flags
        for (const flag of args[i].substring(1)) {
          if (flag === "r") reverse = true;
          else if (flag === "n") numeric = true;
          else if (flag === "f") ignoreCase = true;
        }
      } else {
        // Argument is a file
        files.push(args[i]);
      }
    }

    try {
      let allLines: string[] = [];

      // If no files specified, we would read from stdin in a real terminal
      // For this simulation, return an error
      if (files.length === 0) {
        return {
          success: false,
          error: "No input files specified",
        };
      }

      // Read content from each file
      for (const file of files) {
        const node = filesystem.getNode(file);

        if (!node) {
          return {
            success: false,
            error: `File not found: ${file}`,
          };
        }

        if (!(node instanceof VirtualFile)) {
          return {
            success: false,
            error: `Not a regular file: ${file}`,
          };
        }

        // Read file content
        const content = filesystem.readFile(file).toString();
        const lines = content.split("\n");
        allLines = allLines.concat(lines);
      }

      // Sort the lines
      allLines.sort((a: string, b: string) => {
        // Prepare values based on sort options
        let valA = a;
        let valB = b;

        if (ignoreCase) {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (numeric) {
          const numA = parseFloat(valA);
          const numB = parseFloat(valB);

          // Check if both values are valid numbers
          if (!isNaN(numA) && !isNaN(numB)) {
            return reverse ? numB - numA : numA - numB;
          }
        }

        // Default string comparison
        return reverse ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });

      return {
        success: true,
        output: allLines.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
