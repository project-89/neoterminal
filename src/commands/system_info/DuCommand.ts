import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import {
  VirtualDirectory,
  VirtualFile,
  VirtualNode,
} from "../../filesystem/VirtualNodes";

/**
 * Estimate file space usage
 */
export class DuCommand implements Command {
  name = "du";
  aliases = ["diskusage"];
  category = CommandCategory.SYSTEM_INFO;
  description = "Estimate file space usage";
  usage = "du [options] [file...]";
  examples = ["du", "du -h", "du -s", "du -h /home/user/docs", "du -sh *"];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options
    let humanReadable = false;
    let summarize = false;
    const targets: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        // Parse each flag
        for (let i = 1; i < arg.length; i++) {
          const flag = arg.charAt(i);
          if (flag === "h") humanReadable = true;
          else if (flag === "s") summarize = true;
          else {
            return {
              success: false,
              error: `Invalid option: ${flag}`,
            };
          }
        }
      } else {
        // Not an option, must be a target path
        targets.push(arg);
      }
    }

    // Default to current directory if no targets specified
    if (targets.length === 0) {
      targets.push(".");
    }

    try {
      const output: string[] = [];

      // Process each target
      for (const target of targets) {
        const resolvedPath = filesystem.resolvePath(target);
        const node = filesystem.getNode(resolvedPath);

        if (!node) {
          output.push(
            `du: cannot access '${target}': No such file or directory`
          );
          continue;
        }

        if (summarize) {
          // Just show the total for the target
          const size = this.calculateSize(node);
          output.push(this.formatOutput(size, resolvedPath, humanReadable));
        } else if (node instanceof VirtualDirectory) {
          // Recursively calculate size of directory and its subdirectories
          output.push(
            ...this.calculateSizesRecursive(node, resolvedPath, humanReadable)
          );
        } else {
          // Single file
          const size = node.size();
          output.push(this.formatOutput(size, resolvedPath, humanReadable));
        }
      }

      return {
        success: true,
        output: output.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculate size of a node (file or directory)
   */
  private calculateSize(node: VirtualNode): number {
    if (node instanceof VirtualFile) {
      return node.size();
    } else if (node instanceof VirtualDirectory) {
      let total = 0;
      const children = node.listChildren();
      for (const child of children) {
        total += this.calculateSize(child);
      }
      return total;
    }
    return 0;
  }

  /**
   * Recursively calculate sizes of a directory and its subdirectories
   */
  private calculateSizesRecursive(
    directory: VirtualDirectory,
    path: string,
    humanReadable: boolean
  ): string[] {
    const result: string[] = [];
    const children = directory.listChildren();

    // Calculate size of the directory itself
    const dirSize = this.calculateSize(directory);
    result.push(this.formatOutput(dirSize, path, humanReadable));

    // Calculate sizes of subdirectories
    for (const child of children) {
      if (child instanceof VirtualDirectory) {
        const childPath = `${path}/${child.name}`;
        result.push(
          ...this.calculateSizesRecursive(child, childPath, humanReadable)
        );
      }
    }

    return result;
  }

  /**
   * Format output line for a path
   */
  private formatOutput(
    size: number,
    path: string,
    humanReadable: boolean
  ): string {
    // Convert to KB as du shows sizes in 1K blocks by default
    const sizeInKB = Math.ceil(size / 1024);

    if (humanReadable) {
      return `${this.formatHumanReadable(sizeInKB)}\t${path}`;
    } else {
      return `${sizeInKB}\t${path}`;
    }
  }

  /**
   * Format a size value in human-readable form (e.g., 1K, 234M, 2G)
   */
  private formatHumanReadable(kb: number): string {
    const units = ["K", "M", "G", "T", "P"];
    let size = kb;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    // Round to 1 decimal place
    return size.toFixed(1) + units[unitIndex];
  }
}
