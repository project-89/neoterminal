import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualFile } from "../../filesystem/VirtualNodes";

/**
 * Stream editor for filtering and transforming text
 */
export class SedCommand implements Command {
  name = "sed";
  aliases = ["streameditor"];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Stream editor for filtering and transforming text";
  usage = "sed [options] 'script' [file...]";
  examples = [
    "sed 's/old/new/' file.txt",
    "sed -e 's/old/new/' -e 's/foo/bar/' file.txt",
    "sed -i 's/old/new/' file.txt",
    "sed '3d' file.txt",
    "sed '2,5d' file.txt",
  ];
  skillLevel = SkillLevel.NETRUNNER;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options
    let inPlace = false;
    const scripts: string[] = [];
    const files: string[] = [];

    let i = 0;
    while (i < args.length) {
      const arg = args[i];

      if (arg === "-i" || arg === "--in-place") {
        inPlace = true;
        i++;
      } else if (arg === "-e" || arg === "--expression") {
        if (i + 1 >= args.length) {
          return {
            success: false,
            error: `Option ${arg} requires an argument`,
          };
        }
        scripts.push(args[i + 1]);
        i += 2;
      } else if (arg.startsWith("-")) {
        return {
          success: false,
          error: `Unknown option: ${arg}`,
        };
      } else {
        // If no script has been provided yet, this must be the script
        if (scripts.length === 0) {
          scripts.push(arg);
        } else {
          // Otherwise it's a filename
          files.push(arg);
        }
        i++;
      }
    }

    if (scripts.length === 0) {
      return {
        success: false,
        error: "No script specified",
      };
    }

    // If no files specified, use standard input (not implemented in this simulation)
    if (files.length === 0) {
      return {
        success: false,
        error:
          "No input files specified. Reading from stdin is not supported yet.",
      };
    }

    try {
      const results: string[] = [];
      let hadErrors = false;

      for (const filePath of files) {
        const resolvedPath = filesystem.resolvePath(filePath);
        const node = filesystem.getNode(resolvedPath);

        if (!node) {
          results.push(`sed: ${filePath}: No such file or directory`);
          hadErrors = true;
          continue;
        }

        if (!(node instanceof VirtualFile)) {
          results.push(`sed: ${filePath}: Is a directory`);
          hadErrors = true;
          continue;
        }

        const fileContent = node.getContent().toString();
        const lines = fileContent.split("\n");

        // Apply all scripts to the file content
        const modifiedLines = this.applyScripts(lines, scripts);
        const modifiedContent = modifiedLines.join("\n");

        // If in-place, update the file
        if (inPlace) {
          node.setContent(Buffer.from(modifiedContent));
          continue; // Don't output the content when editing in-place
        }

        // Otherwise, output the result
        results.push(modifiedContent);
      }

      return {
        success: !hadErrors,
        output: results.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during sed execution",
      };
    }
  }

  /**
   * Apply sed scripts to an array of lines
   */
  private applyScripts(lines: string[], scripts: string[]): string[] {
    let result = [...lines];

    for (const script of scripts) {
      result = this.applyScript(result, script);
    }

    return result;
  }

  /**
   * Apply a single sed script to an array of lines
   */
  private applyScript(lines: string[], script: string): string[] {
    // Substitution: s/pattern/replacement/flags
    if (script.startsWith("s/")) {
      return this.handleSubstitution(lines, script);
    }

    // Deletion: [address]d
    if (script.endsWith("d")) {
      return this.handleDeletion(lines, script);
    }

    // Other commands not implemented yet
    // For a full sed implementation, many more commands would be needed

    // If no command matched, return unchanged
    return lines;
  }

  /**
   * Handle substitution command (s/pattern/replacement/flags)
   * Example: s/foo/bar/g
   */
  private handleSubstitution(lines: string[], script: string): string[] {
    // Parse the substitution command
    // Format is s/pattern/replacement/flags
    const parts = this.parseSubstitutionCommand(script);

    if (!parts) {
      // If parsing failed, return unchanged
      return lines;
    }

    const { pattern, replacement, flags } = parts;
    const global = flags.includes("g");
    const ignoreCase = flags.includes("i");

    // Create regex with appropriate flags
    const regex = new RegExp(pattern, ignoreCase ? "i" : "");

    // Apply substitution to each line
    return lines.map((line) => {
      if (global) {
        return line.replace(new RegExp(regex, "g"), replacement);
      } else {
        return line.replace(regex, replacement);
      }
    });
  }

  /**
   * Parse a substitution command into its components
   */
  private parseSubstitutionCommand(
    cmd: string
  ): { pattern: string; replacement: string; flags: string } | null {
    // Basic substitution pattern: s/pattern/replacement/flags
    if (!cmd.startsWith("s/")) {
      return null;
    }

    // Remove the 's/' prefix
    const cmdWithoutPrefix = cmd.slice(2);

    // Find the delimiter character (usually '/')
    const delimiter = "/";

    // Split by delimiter, but handle escaped delimiters
    const parts: string[] = [];
    let currentPart = "";
    let escaped = false;

    for (let i = 0; i < cmdWithoutPrefix.length; i++) {
      const char = cmdWithoutPrefix[i];

      if (char === "\\" && !escaped) {
        escaped = true;
        continue;
      }

      if (char === delimiter && !escaped) {
        parts.push(currentPart);
        currentPart = "";
      } else {
        currentPart += char;
        escaped = false;
      }
    }

    // Add the last part (flags)
    if (currentPart) {
      parts.push(currentPart);
    }

    if (parts.length < 2) {
      return null;
    }

    return {
      pattern: parts[0],
      replacement: parts[1],
      flags: parts[2] || "",
    };
  }

  /**
   * Handle deletion command ([address]d)
   * Examples: 3d, 2,5d
   */
  private handleDeletion(lines: string[], script: string): string[] {
    // Strip the trailing 'd'
    const address = script.slice(0, -1);

    // If the address is empty, no deletion
    if (!address) {
      return lines;
    }

    // Check if it's a range (contains a comma)
    if (address.includes(",")) {
      const [startStr, endStr] = address.split(",");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        return lines;
      }

      // Delete the range (line numbers are 1-based in sed)
      return lines.filter((_, index) => {
        const lineNum = index + 1;
        return lineNum < start || lineNum > end;
      });
    } else {
      // Delete a single line
      const lineNum = parseInt(address, 10);

      if (isNaN(lineNum)) {
        return lines;
      }

      // Delete the specified line (line numbers are 1-based in sed)
      return lines.filter((_, index) => index + 1 !== lineNum);
    }
  }
}
