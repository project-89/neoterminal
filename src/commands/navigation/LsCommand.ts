import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualDirectory, VirtualFile } from "../../filesystem/VirtualNodes";

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
    const { filesystem } = options;

    // Parse options and target directory
    let showHidden = false;
    let longFormat = false;
    let targetPath = filesystem.getCurrentPath();

    for (const arg of args) {
      if (arg.startsWith("-")) {
        // Handle options
        for (const flag of arg.substring(1)) {
          if (flag === "a") showHidden = true;
          if (flag === "l") longFormat = true;
        }
      } else {
        // Assume it's a path
        targetPath = arg;
      }
    }

    try {
      const nodes = filesystem.listDirectory(targetPath);

      // Filter hidden files (starting with .) unless -a flag is used
      const filteredNodes = showHidden
        ? nodes
        : nodes.filter((node) => !node.name.startsWith("."));

      if (filteredNodes.length === 0) {
        return {
          success: true,
          output: "Directory is empty",
        };
      }

      if (longFormat) {
        // Long format listing
        const rows = filteredNodes.map((node) => {
          const type = node instanceof VirtualDirectory ? "d" : "-";
          const size = node.size().toString().padStart(8, " ");
          const date = node.modified.toISOString().substring(0, 10);
          return `${type}${node.permissions.toString()} ${node.owner} ${
            node.group
          } ${size} ${date} ${node.name}${
            node instanceof VirtualDirectory ? "/" : ""
          }`;
        });

        return {
          success: true,
          output: rows.join("\n"),
        };
      } else {
        // Simple listing
        const items = filteredNodes.map((node) =>
          node instanceof VirtualDirectory
            ? `\x1b[36m${node.name}/\x1b[0m`
            : node.name
        );

        return {
          success: true,
          output: items.join("  "),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
