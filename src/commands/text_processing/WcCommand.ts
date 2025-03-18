import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualFile } from "../../filesystem/VirtualNodes";

/**
 * Count lines, words, and bytes in files
 */
export class WcCommand implements Command {
  name = "wc";
  aliases = ["wordcount"];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Print newline, word, and byte counts for files";
  usage = "wc [options] [file...]";
  examples = [
    "wc file.txt",
    "wc -l file.txt",
    "wc -w file.txt",
    "wc -c file.txt",
  ];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options
    let showLines = true;
    let showWords = true;
    let showBytes = true;
    let optionsSpecified = false;
    const filePaths: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        optionsSpecified = true;
        // Reset all flags if options are specified
        if (arg === arg.charAt(0)) {
          showLines = false;
          showWords = false;
          showBytes = false;
        }

        // Parse each flag
        for (let i = 1; i < arg.length; i++) {
          const flag = arg.charAt(i);
          if (flag === "l") showLines = true;
          else if (flag === "w") showWords = true;
          else if (flag === "c") showBytes = true;
          else if (flag === "m") {
            // Characters count (we'll treat the same as bytes for simplicity)
            showBytes = true;
          } else {
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

    // If no options were specified, show all counts by default
    if (!optionsSpecified) {
      showLines = true;
      showWords = true;
      showBytes = true;
    }

    // If no files specified, return error
    // In a real terminal, wc would read from stdin
    if (filePaths.length === 0) {
      return {
        success: false,
        error: "No input files specified",
      };
    }

    try {
      const results: Array<{
        file: string;
        lines: number;
        words: number;
        bytes: number;
      }> = [];

      let totalLines = 0;
      let totalWords = 0;
      let totalBytes = 0;

      // Process each file
      for (const filePath of filePaths) {
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

        // Read file content
        const content = filesystem.readFile(filePath).toString();

        // Count lines, words, and bytes
        const lines = content.split("\n").length;
        const words = content
          .trim()
          .split(/\s+/)
          .filter((word: string) => word.length > 0).length;
        const bytes = Buffer.from(content).length;

        // Store results
        results.push({
          file: filePath,
          lines,
          words,
          bytes,
        });

        // Update totals
        totalLines += lines;
        totalWords += words;
        totalBytes += bytes;
      }

      // Format output
      let output = "";

      // Add results for each file
      for (const result of results) {
        let line = "";
        if (showLines) line += `${result.lines.toString().padStart(8)}`;
        if (showWords) line += `${result.words.toString().padStart(8)}`;
        if (showBytes) line += `${result.bytes.toString().padStart(8)}`;
        line += ` ${result.file}`;

        output += line + "\n";
      }

      // Add total line if multiple files
      if (filePaths.length > 1) {
        let totalLine = "";
        if (showLines) totalLine += `${totalLines.toString().padStart(8)}`;
        if (showWords) totalLine += `${totalWords.toString().padStart(8)}`;
        if (showBytes) totalLine += `${totalBytes.toString().padStart(8)}`;
        totalLine += " total";

        output += totalLine;
      } else {
        // Remove trailing newline for single file
        output = output.trimEnd();
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
