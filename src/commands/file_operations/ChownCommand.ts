import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualNode } from "../../filesystem/VirtualNodes";

/**
 * Change file owner and group command
 */
export class ChownCommand implements Command {
  name = "chown";
  aliases = ["owner"];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Change file owner and group";
  usage = "chown [options] owner[:group] file...";
  examples = [
    "chown admin file.txt",
    "chown admin:staff file.txt",
    "chown -R admin /home/user/docs/",
  ];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Check argument count
    if (args.length < 2) {
      return {
        success: false,
        error: "Missing operand. Usage: chown [options] owner[:group] file...",
      };
    }

    // Parse options
    let recursive = false;
    let ownerGroup = "";
    let targets: string[] = [];

    // Process arguments
    args.forEach((arg) => {
      if (arg.startsWith("-")) {
        // Handle options
        for (const flag of arg.substring(1)) {
          if (flag === "R" || flag === "r") recursive = true;
        }
      } else if (ownerGroup === "") {
        // First non-option argument is the owner[:group]
        ownerGroup = arg;
      } else {
        // Subsequent arguments are target files/directories
        targets.push(arg);
      }
    });

    if (ownerGroup === "" || targets.length === 0) {
      return {
        success: false,
        error: "Missing owner or file operand",
      };
    }

    // Parse owner and group
    let owner: string | null = null;
    let group: string | null = null;

    if (ownerGroup.includes(":")) {
      const parts = ownerGroup.split(":");
      owner = parts[0] || null;
      group = parts[1] || null;
    } else {
      owner = ownerGroup;
    }

    // Validate owner and group
    if (owner === null && group === null) {
      return {
        success: false,
        error: "Invalid owner specification",
      };
    }

    try {
      let successCount = 0;
      const errors: string[] = [];

      // Process each target
      for (const target of targets) {
        const node = filesystem.getNode(target);

        if (!node) {
          errors.push(
            `Cannot change owner of '${target}': No such file or directory`
          );
          continue;
        }

        try {
          if (recursive && node.type() === "directory") {
            // Apply recursively to directory and its contents
            this.chownRecursive(filesystem, target, owner, group);
          } else {
            // Apply to single file/directory
            this.chown(node, owner, group);
          }
          successCount++;
        } catch (err) {
          errors.push(
            `Error changing owner of '${target}': ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        }
      }

      // Generate result
      if (successCount === 0) {
        return {
          success: false,
          error: errors.join("\n"),
        };
      } else if (errors.length > 0) {
        return {
          success: true,
          output: `Changed ownership of ${successCount} item(s) with errors:\n${errors.join(
            "\n"
          )}`,
        };
      } else {
        return {
          success: true,
          output: `Successfully changed ownership of ${successCount} item(s)`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Change owner/group of a single node
   */
  private chown(
    node: VirtualNode,
    owner: string | null,
    group: string | null
  ): void {
    if (owner !== null) {
      node.owner = owner;
    }

    if (group !== null) {
      node.group = group;
    }
  }

  /**
   * Change owner/group recursively for a directory
   */
  private chownRecursive(
    filesystem: any,
    path: string,
    owner: string | null,
    group: string | null
  ): void {
    const node = filesystem.getNode(path);

    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }

    // Change owner/group of this node
    this.chown(node, owner, group);

    // If it's a directory, process all children recursively
    if (node.type() === "directory") {
      const children = node.listChildren();
      for (const child of children) {
        const childPath = `${path}/${child.name}`;
        this.chownRecursive(filesystem, childPath, owner, group);
      }
    }
  }
}
