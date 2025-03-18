import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import {
  VirtualFile,
  VirtualDirectory,
  VirtualNode,
} from "../../filesystem/VirtualNodes";

/**
 * Copy file or directory command
 */
export class CpCommand implements Command {
  name = "cp";
  aliases = ["copy"];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Copy files and directories";
  usage = "cp [options] source destination";
  examples = [
    "cp file.txt backup.txt",
    "cp /home/user/doc.txt /home/user/docs/",
    "cp -r directory /home/user/backup/",
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
        error: "Missing operand. Usage: cp [options] source destination",
      };
    }

    // Parse options
    let recursive = false;
    let sources: string[] = [];
    let destination = "";

    // Process arguments
    args.forEach((arg) => {
      if (arg.startsWith("-")) {
        // Handle options
        for (const flag of arg.substring(1)) {
          if (flag === "r") recursive = true;
        }
      } else {
        // Add to source or set destination
        if (destination === "") {
          // If there's only one argument left, it must be the destination
          if (args.indexOf(arg) === args.length - 1 && sources.length > 0) {
            destination = arg;
          } else {
            sources.push(arg);
          }
        } else {
          // If destination is already set, everything else must be a source
          sources.push(arg);
        }
      }
    });

    // Ensure the last argument is the destination
    if (sources.length > 0 && destination === "") {
      destination = sources.pop() || "";
    }

    if (sources.length === 0 || destination === "") {
      return {
        success: false,
        error: "Missing source or destination operand",
      };
    }

    try {
      // Check if destination exists and is a directory
      const destNode = filesystem.getNode(destination);
      const destIsDir = destNode && destNode instanceof VirtualDirectory;

      // If multiple sources, destination must be a directory
      if (sources.length > 1 && !destIsDir) {
        return {
          success: false,
          error: `When copying multiple sources, destination (${destination}) must be a directory`,
        };
      }

      let successCount = 0;
      const errors: string[] = [];

      // Process each source
      for (const source of sources) {
        const sourceNode = filesystem.getNode(source);

        if (!sourceNode) {
          errors.push(`Cannot copy '${source}': No such file or directory`);
          continue;
        }

        let targetPath: string;

        if (destIsDir) {
          // If destination is a directory, copy into it with the same name
          const sourceName = source.split("/").pop() || "";
          targetPath = `${destination}/${sourceName}`;
        } else {
          // If destination is not a directory, it's a direct target
          targetPath = destination;
        }

        try {
          if (sourceNode instanceof VirtualDirectory) {
            if (!recursive) {
              errors.push(
                `Cannot copy '${source}': Is a directory (use -r for recursive copy)`
              );
              continue;
            }

            // Copy directory recursively
            this.copyDirectoryRecursive(filesystem, source, targetPath);
            successCount++;
          } else if (sourceNode instanceof VirtualFile) {
            // Copy file
            this.copyFile(filesystem, source, targetPath);
            successCount++;
          }
        } catch (err) {
          errors.push(
            `Error copying '${source}' to '${targetPath}': ${
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
          output: `Copied ${successCount} item(s) with errors:\n${errors.join(
            "\n"
          )}`,
        };
      } else {
        return {
          success: true,
          output: `Successfully copied ${successCount} item(s)`,
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
   * Copy a file from source to destination
   */
  private copyFile(
    filesystem: any,
    sourcePath: string,
    destPath: string
  ): void {
    const sourceContent = filesystem.readFile(sourcePath);
    filesystem.writeFile(destPath, sourceContent.toString());

    // Copy permissions as well
    const sourceNode = filesystem.getNode(sourcePath) as VirtualFile;
    const destNode = filesystem.getNode(destPath) as VirtualFile;

    if (sourceNode && destNode) {
      destNode.permissions = sourceNode.permissions.clone();
      destNode.owner = sourceNode.owner;
      destNode.group = sourceNode.group;
    }
  }

  /**
   * Copy a directory recursively
   */
  private copyDirectoryRecursive(
    filesystem: any,
    sourcePath: string,
    destPath: string
  ): void {
    const sourceNode = filesystem.getNode(sourcePath) as VirtualDirectory;

    if (!sourceNode || !(sourceNode instanceof VirtualDirectory)) {
      throw new Error(`Source is not a directory: ${sourcePath}`);
    }

    // Create destination directory if it doesn't exist
    const destNode = filesystem.getNode(destPath);
    if (!destNode) {
      filesystem.mkdir(destPath);
    } else if (!(destNode instanceof VirtualDirectory)) {
      throw new Error(`Destination exists but is not a directory: ${destPath}`);
    }

    // Copy permissions
    const destinationDir = filesystem.getNode(destPath) as VirtualDirectory;
    destinationDir.permissions = sourceNode.permissions.clone();
    destinationDir.owner = sourceNode.owner;
    destinationDir.group = sourceNode.group;

    // Copy all children
    const children = sourceNode.listChildren();
    for (const child of children) {
      const childSourcePath = `${sourcePath}/${child.name}`;
      const childDestPath = `${destPath}/${child.name}`;

      if (child instanceof VirtualDirectory) {
        this.copyDirectoryRecursive(filesystem, childSourcePath, childDestPath);
      } else if (child instanceof VirtualFile) {
        this.copyFile(filesystem, childSourcePath, childDestPath);
      }
    }
  }
}
