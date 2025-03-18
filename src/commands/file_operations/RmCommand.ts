import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualDirectory } from "../../filesystem/VirtualNodes";

/**
 * Remove file or directory command
 */
export class RmCommand implements Command {
  name = "rm";
  aliases = ["del", "delete"];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Remove files or directories";
  usage = "rm [options] <target>";
  examples = ["rm file.txt", "rm -r directory", "rm -rf unwanted_dir"];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    if (args.length === 0) {
      return {
        success: false,
        error: "Missing operand",
      };
    }

    // Parse options
    let recursive = false;
    let force = false;
    let target = "";

    for (const arg of args) {
      if (arg.startsWith("-")) {
        for (const flag of arg.substring(1)) {
          if (flag === "r") recursive = true;
          if (flag === "f") force = true;
        }
      } else {
        target = arg;
      }
    }

    if (!target) {
      return {
        success: false,
        error: "Missing target",
      };
    }

    try {
      const node = filesystem.getNode(target);

      if (!node) {
        if (force) {
          // With force flag, silently ignore non-existent files
          return {
            success: true,
          };
        } else {
          return {
            success: false,
            error: `Cannot remove '${target}': No such file or directory`,
          };
        }
      }

      if (node instanceof VirtualDirectory && !recursive) {
        return {
          success: false,
          error: `Cannot remove '${target}': Is a directory. Use -r to remove directories`,
        };
      }

      filesystem.deleteNode(target);

      return {
        success: true,
        output: `Removed '${target}'`,
      };
    } catch (error) {
      if (force) {
        // With force flag, suppress errors
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
