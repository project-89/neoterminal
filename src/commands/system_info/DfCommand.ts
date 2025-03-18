import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualDirectory, VirtualNode } from "../../filesystem/VirtualNodes";

/**
 * Report filesystem disk space usage
 */
export class DfCommand implements Command {
  name = "df";
  aliases = ["diskfree"];
  category = CommandCategory.SYSTEM_INFO;
  description = "Report filesystem disk space usage";
  usage = "df [options] [file...]";
  examples = ["df", "df -h", "df /home", "df -h /home /data"];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options
    let humanReadable = false;
    const filePaths: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        // Parse each flag
        for (let i = 1; i < arg.length; i++) {
          const flag = arg.charAt(i);
          if (flag === "h") humanReadable = true;
          else {
            return {
              success: false,
              error: `Invalid option: ${flag}`,
            };
          }
        }
      } else {
        // Not an option, must be a file path
        filePaths.push(arg);
      }
    }

    // Use root filesystem if no paths are specified
    if (filePaths.length === 0) {
      filePaths.push("/");
    }

    try {
      // Define filesystem partitions (simulated)
      interface FilesystemInfo {
        mountPoint: string;
        size: number; // Size in KB
        used: number; // Used in KB
        available: number; // Available in KB
        usePercentage: number;
        mountedOn: string;
      }

      // Define simulated filesystems (we'll have a few partitions in our virtual system)
      const filesystems: FilesystemInfo[] = [
        {
          mountPoint: "/",
          size: 512 * 1024 * 1024, // 512 GB
          used: 128 * 1024 * 1024, // 128 GB
          available: 384 * 1024 * 1024, // 384 GB
          usePercentage: 25,
          mountedOn: "/",
        },
        {
          mountPoint: "/home",
          size: 1024 * 1024 * 1024, // 1 TB
          used: 256 * 1024 * 1024, // 256 GB
          available: 768 * 1024 * 1024, // 768 GB
          usePercentage: 25,
          mountedOn: "/home",
        },
        {
          mountPoint: "/data",
          size: 2048 * 1024 * 1024, // 2 TB
          used: 512 * 1024 * 1024, // 512 GB
          available: 1536 * 1024 * 1024, // 1.5 TB
          usePercentage: 25,
          mountedOn: "/data",
        },
      ];

      // Filter filesystems based on the provided paths
      const relevantFilesystems: FilesystemInfo[] = [];

      for (const path of filePaths) {
        // Resolve and validate the path
        const resolvedPath = filesystem.resolvePath(path);

        const node = filesystem.getNode(resolvedPath);
        if (!node) {
          return {
            success: false,
            error: `Cannot access '${path}': No such file or directory`,
          };
        }

        // Find the filesystem that contains this path
        // In a real system, we'd check which filesystem actually contains the path
        // Here we'll just check if the path starts with the mountpoint
        const fs = filesystems.find(
          (fs) =>
            resolvedPath === fs.mountPoint ||
            resolvedPath.startsWith(fs.mountPoint + "/")
        );

        if (
          fs &&
          !relevantFilesystems.some((rfs) => rfs.mountPoint === fs.mountPoint)
        ) {
          relevantFilesystems.push(fs);
        }
      }

      // Generate output
      const headers = [
        "Filesystem",
        humanReadable ? "Size" : "1K-blocks",
        "Used",
        "Available",
        "Use%",
        "Mounted on",
      ];

      // Format table rows
      const rows: string[][] = relevantFilesystems.map((fs) => {
        return [
          fs.mountPoint,
          humanReadable
            ? this.formatHumanReadable(fs.size)
            : fs.size.toString(),
          humanReadable
            ? this.formatHumanReadable(fs.used)
            : fs.used.toString(),
          humanReadable
            ? this.formatHumanReadable(fs.available)
            : fs.available.toString(),
          `${fs.usePercentage}%`,
          fs.mountedOn,
        ];
      });

      // Calculate column widths
      const columnWidths: number[] = [];
      for (let i = 0; i < headers.length; i++) {
        columnWidths[i] = headers[i].length;
        for (const row of rows) {
          columnWidths[i] = Math.max(columnWidths[i], row[i].length);
        }
      }

      // Generate the formatted output
      let output = "";

      // Add header row
      const headerRow = headers
        .map((header, i) => header.padEnd(columnWidths[i]))
        .join("  ");
      output += headerRow + "\n";

      // Add data rows
      for (const row of rows) {
        const formattedRow = row
          .map((cell, i) => cell.padEnd(columnWidths[i]))
          .join("  ");
        output += formattedRow + "\n";
      }

      return {
        success: true,
        output: output.trimEnd(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
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
