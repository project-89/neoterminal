import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
  TerminalStyle,
} from "../../../types";
import {
  VirtualDirectory,
  VirtualFile,
  VirtualNode,
} from "../../filesystem/VirtualNodes";
import themeManager from "../../terminal/themes/ThemeManager";
import chalk from "chalk";

/**
 * List directory contents command
 */
export class LsCommand implements Command {
  name = "ls";
  aliases = ["dir", "list"];
  category = CommandCategory.NAVIGATION;
  description = "List directory contents";
  usage = "ls [options] [directory]";
  examples = ["ls", "ls /home/user", "ls -l", "ls -la"];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    try {
      const { filesystem, currentDirectory, terminal } = options;

      // Get active theme for colorization
      const theme = themeManager.getActiveTheme();
      const palette = themeManager.getColorPalette();

      // Parse command options
      const showAll =
        args.includes("-a") || args.includes("-la") || args.includes("-al");
      const showDetails =
        args.includes("-l") || args.includes("-la") || args.includes("-al");

      // Determine target path
      let targetPath = currentDirectory;
      if (args.length > 0 && !args[0].startsWith("-")) {
        targetPath = args[0];
      }

      // Resolve the target path
      const resolvedPath = filesystem.resolvePath(targetPath);

      // Try to get the node at the path
      const node = filesystem.getNode(resolvedPath);

      if (!node) {
        return {
          success: false,
          error: `ls: cannot access '${targetPath}': No such file or directory`,
        };
      }

      // If it's a file, just show the file name
      if (node.type() === "file") {
        const result = this.formatNode(node, showDetails, resolvedPath, theme);
        return {
          success: true,
          output: result,
        };
      }

      // If it's a directory, show contents
      const directory = node as VirtualDirectory;
      const children = directory.listChildren();

      // Filter out hidden files if -a is not specified
      const filteredChildren = showAll
        ? children
        : children.filter((child) => !child.name.startsWith("."));

      if (filteredChildren.length === 0) {
        return {
          success: true,
          output: "",
        };
      }

      let output: string[] = [];

      // Show directory contents
      if (showDetails) {
        // Detailed view
        filteredChildren.forEach((child) => {
          output.push(this.formatNode(child, true, resolvedPath, theme));
        });
      } else {
        // Simple view - format in columns
        const colorizedNames = filteredChildren.map((child) => {
          if (child.type() === "directory") {
            // Use ANSI color codes instead of HTML
            return chalk.hex(palette.secondary)(`${child.name}/`);
          } else {
            return child.name;
          }
        });

        // Use terminal for proper display if available
        if (terminal) {
          output = colorizedNames;
        } else {
          output = [colorizedNames.join("  ")];
        }
      }

      return {
        success: true,
        output: output.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Format a node for display
   */
  private formatNode(
    node: VirtualNode,
    detailed: boolean,
    path: string,
    theme: any
  ): string {
    if (!detailed) {
      return node.type() === "directory"
        ? chalk.hex(theme.blue)(`${node.name}/`)
        : node.name;
    }

    const permissions = node.permissions.toString();
    const owner = node.owner;
    const group = node.group;
    const size = node.size().toString().padStart(8, " ");
    const modified = node.modified.toLocaleDateString();

    // Apply color based on node type
    const name =
      node.type() === "directory"
        ? chalk.hex(theme.blue)(`${node.name}/`)
        : node.name;

    return `${permissions}  ${owner.padEnd(8)} ${group.padEnd(
      8
    )} ${size} ${modified}  ${name}`;
  }
}
