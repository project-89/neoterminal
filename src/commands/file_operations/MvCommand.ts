import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualDirectory, VirtualNode } from "../../filesystem/VirtualNodes";

/**
 * Move file or directory command
 */
export class MvCommand implements Command {
  name = "mv";
  aliases = ["move", "rename"];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Move or rename files and directories";
  usage = "mv [options] source destination";
  examples = [
    "mv file.txt newname.txt",
    "mv /home/user/doc.txt /home/user/docs/",
    "mv folder /home/user/backup/",
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
        error: "Missing operand. Usage: mv [options] source destination",
      };
    }

    // Parse arguments
    let sources: string[] = [];
    let destination = "";

    // Process arguments - last argument is always the destination
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (i === args.length - 1) {
        destination = arg;
      } else {
        sources.push(arg);
      }
    }

    try {
      // Check if destination exists and is a directory
      const destNode = filesystem.getNode(destination);
      const destIsDir = destNode && destNode instanceof VirtualDirectory;

      // If multiple sources, destination must be a directory
      if (sources.length > 1 && !destIsDir) {
        return {
          success: false,
          error: `When moving multiple sources, destination (${destination}) must be a directory`,
        };
      }

      let successCount = 0;
      const errors: string[] = [];

      // Process each source
      for (const source of sources) {
        const sourceNode = filesystem.getNode(source);

        if (!sourceNode) {
          errors.push(`Cannot move '${source}': No such file or directory`);
          continue;
        }

        let targetPath: string;

        if (destIsDir) {
          // If destination is a directory, move into it with the same name
          const sourceName = source.split("/").pop() || "";
          targetPath = `${destination}/${sourceName}`;
        } else {
          // If destination is not a directory, it's a direct target
          targetPath = destination;
        }

        try {
          // Check if attempting to move a directory into its own subdirectory
          if (
            sourceNode instanceof VirtualDirectory &&
            targetPath.startsWith(source + "/")
          ) {
            errors.push(`Cannot move '${source}' into itself: '${targetPath}'`);
            continue;
          }

          // Check if target already exists and is different from source
          const targetExists = filesystem.getNode(targetPath) !== null;

          if (targetExists && targetPath !== source) {
            // Remove target first
            filesystem.deleteNode(targetPath);
          }

          // Moving is essentially copying and then deleting the original
          this.moveNode(filesystem, source, targetPath);
          successCount++;
        } catch (err) {
          errors.push(
            `Error moving '${source}' to '${targetPath}': ${
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
          output: `Moved ${successCount} item(s) with errors:\n${errors.join(
            "\n"
          )}`,
        };
      } else {
        return {
          success: true,
          output: `Successfully moved ${successCount} item(s)`,
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
   * Move a node from source to destination
   */
  private moveNode(
    filesystem: any,
    sourcePath: string,
    destPath: string
  ): void {
    const sourceNode = filesystem.getNode(sourcePath);

    if (!sourceNode) {
      throw new Error(`Source does not exist: ${sourcePath}`);
    }

    // If source and destination are the same, do nothing
    if (sourcePath === destPath) {
      return;
    }

    // For simple rename within the same directory, we don't need to copy content
    const sourceParentPath = this.getParentPath(sourcePath);
    const destParentPath = this.getParentPath(destPath);

    if (sourceParentPath === destParentPath) {
      // Same parent directory, just need to rename
      this.renameNode(filesystem, sourcePath, destPath);
      return;
    }

    // Different directories - need to copy and then delete

    // Check if source is file or directory
    // We can use the clone method built into VirtualNode classes
    const clonedNode = sourceNode.clone();
    const destParent = filesystem.getNode(destParentPath) as VirtualDirectory;

    if (!destParent || !(destParent instanceof VirtualDirectory)) {
      throw new Error(
        `Destination parent is not a directory: ${destParentPath}`
      );
    }

    // New file/dir name
    const newName = destPath.split("/").pop() || "";
    clonedNode.name = newName;
    clonedNode.parent = destParent;

    // Add to new parent
    destParent.addChild(clonedNode);

    // Delete original
    filesystem.deleteNode(sourcePath);
  }

  /**
   * Rename a node within the same directory
   */
  private renameNode(
    filesystem: any,
    sourcePath: string,
    destPath: string
  ): void {
    const sourceNode = filesystem.getNode(sourcePath);
    if (!sourceNode) {
      throw new Error(`Source does not exist: ${sourcePath}`);
    }

    const parentPath = this.getParentPath(sourcePath);
    const parent = filesystem.getNode(parentPath) as VirtualDirectory;

    if (!parent || !(parent instanceof VirtualDirectory)) {
      throw new Error(`Parent is not a directory: ${parentPath}`);
    }

    // Remove from parent with old name
    parent.removeChild(sourceNode.name);

    // Update name
    sourceNode.name = destPath.split("/").pop() || "";

    // Add back to parent with new name
    parent.addChild(sourceNode);
  }

  /**
   * Get the parent directory path
   */
  private getParentPath(path: string): string {
    const parts = path.split("/");
    parts.pop(); // Remove the last part (file/dir name)
    return parts.join("/") || "/";
  }
}
