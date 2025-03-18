import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import {
  VirtualNode,
  FilePermissions,
  Permission,
} from "../../filesystem/VirtualNodes";

/**
 * Change file permissions command
 */
export class ChmodCommand implements Command {
  name = "chmod";
  aliases = ["permissions"];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Change file permissions";
  usage = "chmod [options] mode file...";
  examples = [
    "chmod 755 file.txt",
    "chmod u+x script.sh",
    "chmod -R 644 /home/user/docs/",
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
        error: "Missing operand. Usage: chmod [options] mode file...",
      };
    }

    // Parse options
    let recursive = false;
    let mode = "";
    let targets: string[] = [];

    // Process arguments
    args.forEach((arg) => {
      if (arg.startsWith("-")) {
        // Handle options
        for (const flag of arg.substring(1)) {
          if (flag === "R" || flag === "r") recursive = true;
        }
      } else if (mode === "") {
        // First non-option argument is the mode
        mode = arg;
      } else {
        // Subsequent arguments are target files/directories
        targets.push(arg);
      }
    });

    if (mode === "" || targets.length === 0) {
      return {
        success: false,
        error: "Missing mode or file operand",
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
            `Cannot change mode of '${target}': No such file or directory`
          );
          continue;
        }

        try {
          if (recursive && node.type() === "directory") {
            // Apply recursively to directory and its contents
            this.chmodRecursive(filesystem, target, mode);
          } else {
            // Apply to single file/directory
            this.chmod(node, mode);
          }
          successCount++;
        } catch (err) {
          errors.push(
            `Error changing permissions of '${target}': ${
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
          output: `Changed permissions of ${successCount} item(s) with errors:\n${errors.join(
            "\n"
          )}`,
        };
      } else {
        return {
          success: true,
          output: `Successfully changed permissions of ${successCount} item(s)`,
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
   * Change permissions of a single node
   */
  private chmod(node: VirtualNode, mode: string): void {
    // Check if numeric mode (e.g., 755)
    if (/^[0-7]{3,4}$/.test(mode)) {
      this.applyNumericMode(node, mode);
    } else {
      // Symbolic mode (e.g., u+x,g-w)
      this.applySymbolicMode(node, mode);
    }
  }

  /**
   * Apply numeric permission mode (e.g., 755)
   */
  private applyNumericMode(node: VirtualNode, mode: string): void {
    // Handle 3 or 4 digit modes (we ignore the first digit in 4-digit modes for simplicity)
    const digits = mode.length === 4 ? mode.substring(1) : mode;

    // Parse octal values
    const userValue = parseInt(digits[0], 8) as Permission;
    const groupValue = parseInt(digits[1], 8) as Permission;
    const otherValue = parseInt(digits[2], 8) as Permission;

    // Update permissions
    node.permissions = new FilePermissions(userValue, groupValue, otherValue);
  }

  /**
   * Apply symbolic permission mode (e.g., u+x,g-w)
   */
  private applySymbolicMode(node: VirtualNode, mode: string): void {
    // Split by comma for multiple operations (e.g., u+x,g-w)
    const operations = mode.split(",");

    for (const operation of operations) {
      // Match pattern: [ugoa]*[+-=][rwx]*
      const match = operation.match(/^([ugoa]*)([+-=])([rwx]*)$/);

      if (!match) {
        throw new Error(`Invalid mode: ${operation}`);
      }

      const [_, target, op, permStr] = match;

      // Determine the permission value
      let permValue = Permission.NONE;
      if (permStr.includes("r")) permValue |= Permission.READ;
      if (permStr.includes("w")) permValue |= Permission.WRITE;
      if (permStr.includes("x")) permValue |= Permission.EXECUTE;

      // Apply to specified targets (user, group, other, all)
      const applyToUser =
        target.includes("u") || target.includes("a") || target === "";
      const applyToGroup =
        target.includes("g") || target.includes("a") || target === "";
      const applyToOther =
        target.includes("o") || target.includes("a") || target === "";

      // Current permissions
      const { user, group, other } = node.permissions;

      // Apply the operation
      if (op === "+") {
        // Add permissions
        if (applyToUser) node.permissions.user |= permValue;
        if (applyToGroup) node.permissions.group |= permValue;
        if (applyToOther) node.permissions.other |= permValue;
      } else if (op === "-") {
        // Remove permissions
        if (applyToUser) node.permissions.user &= ~permValue;
        if (applyToGroup) node.permissions.group &= ~permValue;
        if (applyToOther) node.permissions.other &= ~permValue;
      } else if (op === "=") {
        // Set permissions exactly
        if (applyToUser) node.permissions.user = permValue;
        if (applyToGroup) node.permissions.group = permValue;
        if (applyToOther) node.permissions.other = permValue;
      }
    }
  }

  /**
   * Change permissions recursively for a directory
   */
  private chmodRecursive(filesystem: any, path: string, mode: string): void {
    const node = filesystem.getNode(path);

    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }

    // Change permissions of this node
    this.chmod(node, mode);

    // If it's a directory, process all children recursively
    if (node.type() === "directory") {
      const children = node.listChildren();
      for (const child of children) {
        const childPath = `${path}/${child.name}`;
        this.chmodRecursive(filesystem, childPath, mode);
      }
    }
  }
}
