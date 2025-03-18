import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualFile } from "../../filesystem/VirtualNodes";

/**
 * Grep command for searching text patterns in files
 */
export class GrepCommand implements Command {
  name = "grep";
  aliases = ["search"];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Search for patterns in files";
  usage = "grep [options] pattern [file...]";
  examples = [
    "grep 'password' file.txt",
    "grep -i 'error' log.txt",
    "grep -r 'TODO' /home/user/projects",
  ];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Check for sufficient arguments
    if (args.length < 1) {
      return {
        success: false,
        error: "Usage: grep [options] pattern [file...]",
      };
    }

    // Parse options
    let ignoreCase = false;
    let recursive = false;
    let lineNumbers = false;
    let pattern = "";
    let files: string[] = [];

    // Parse arguments
    let i = 0;
    while (i < args.length) {
      if (args[i].startsWith("-")) {
        // Handle option flags
        for (const flag of args[i].substring(1)) {
          if (flag === "i") ignoreCase = true;
          else if (flag === "r") recursive = true;
          else if (flag === "n") lineNumbers = true;
        }
      } else if (!pattern) {
        // First non-option arg is the pattern
        pattern = args[i];
      } else {
        // Subsequent args are files
        files.push(args[i]);
      }
      i++;
    }

    // If no files are specified and not recursive, show error
    if (files.length === 0 && !recursive) {
      return {
        success: false,
        error: "No files specified for searching",
      };
    }

    // If recursive but no files/directories specified, use current directory
    if (recursive && files.length === 0) {
      files.push(filesystem.getCurrentPath());
    }

    try {
      let results: string[] = [];

      // Create a RegExp for matching
      const regexPattern = ignoreCase
        ? new RegExp(pattern, "i")
        : new RegExp(pattern);

      // Process each file or directory
      for (const filePath of files) {
        if (recursive) {
          results = results.concat(
            await this.searchRecursively(
              filesystem,
              filePath,
              regexPattern,
              lineNumbers
            )
          );
        } else {
          results = results.concat(
            await this.searchFile(
              filesystem,
              filePath,
              regexPattern,
              lineNumbers
            )
          );
        }
      }

      if (results.length === 0) {
        return {
          success: true,
          output: `No matches found for '${pattern}'`,
        };
      }

      return {
        success: true,
        output: results.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search a file for pattern matches
   */
  private async searchFile(
    filesystem: any,
    filePath: string,
    pattern: RegExp,
    showLineNumbers: boolean
  ): Promise<string[]> {
    try {
      const node = filesystem.getNode(filePath);

      if (!node) {
        throw new Error(`File not found: ${filePath}`);
      }

      if (!(node instanceof VirtualFile)) {
        throw new Error(`Not a regular file: ${filePath}`);
      }

      // Read file content
      const content = filesystem.readFile(filePath).toString();
      const lines = content.split("\n");
      const matches: string[] = [];

      // Search for matches in each line
      lines.forEach((line: string, index: number) => {
        if (pattern.test(line)) {
          const lineNumber = index + 1;
          if (showLineNumbers) {
            matches.push(`${filePath}:${lineNumber}: ${line}`);
          } else {
            matches.push(`${filePath}: ${line}`);
          }
        }
      });

      return matches;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search recursively through directories
   */
  private async searchRecursively(
    filesystem: any,
    dirPath: string,
    pattern: RegExp,
    showLineNumbers: boolean
  ): Promise<string[]> {
    const results: string[] = [];
    try {
      const node = filesystem.getNode(dirPath);

      if (!node) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      if (node instanceof VirtualFile) {
        // It's a file, search it directly
        return await this.searchFile(
          filesystem,
          dirPath,
          pattern,
          showLineNumbers
        );
      }

      // It's a directory, list contents and search recursively
      const contents = filesystem.listDirectory(dirPath);

      for (const childNode of contents) {
        const childPath = `${dirPath === "/" ? "" : dirPath}/${childNode.name}`;

        if (childNode instanceof VirtualFile) {
          // Search file
          const fileResults = await this.searchFile(
            filesystem,
            childPath,
            pattern,
            showLineNumbers
          );
          results.push(...fileResults);
        } else {
          // Recursively search subdirectory
          const dirResults = await this.searchRecursively(
            filesystem,
            childPath,
            pattern,
            showLineNumbers
          );
          results.push(...dirResults);
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}
