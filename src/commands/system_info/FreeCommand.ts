import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

/**
 * Display amount of free and used memory in the system
 */
export class FreeCommand implements Command {
  name = "free";
  aliases = ["memory"];
  category = CommandCategory.SYSTEM_INFO;
  description = "Display amount of free and used memory in the system";
  usage = "free [options]";
  examples = ["free", "free -h", "free -m", "free -g"];
  skillLevel = SkillLevel.OPERATOR;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    // Parse options
    let format: "b" | "k" | "m" | "g" | "h" = "k"; // Default to kilobytes
    let wide = false;

    for (const arg of args) {
      if (arg.startsWith("-")) {
        // Parse each flag
        for (let i = 1; i < arg.length; i++) {
          const flag = arg.charAt(i);
          if (flag === "b") format = "b";
          else if (flag === "k") format = "k";
          else if (flag === "m") format = "m";
          else if (flag === "g") format = "g";
          else if (flag === "h") format = "h";
          else if (flag === "w") wide = true;
          else {
            return {
              success: false,
              error: `Invalid option: ${flag}`,
            };
          }
        }
      } else {
        return {
          success: false,
          error: `Invalid argument: ${arg}`,
        };
      }
    }

    try {
      // Simulate memory information
      // These values would come from the system in a real implementation
      const memoryInfo = {
        total: 16384000, // 16GB in KB
        used: 8192000, // 8GB in KB
        free: 8192000, // 8GB in KB
        shared: 512000, // 512MB in KB
        buffers: 1024000, // 1GB in KB
        cache: 4096000, // 4GB in KB
        available: 12288000, // 12GB in KB
      };

      // Swap information
      const swapInfo = {
        total: 8192000, // 8GB in KB
        used: 1024000, // 1GB in KB
        free: 7168000, // 7GB in KB
      };

      // Format the output
      return {
        success: true,
        output: this.formatOutput(memoryInfo, swapInfo, format, wide),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Format memory values based on the specified format
   */
  private formatValue(
    value: number,
    format: "b" | "k" | "m" | "g" | "h"
  ): string {
    switch (format) {
      case "b":
        return `${value * 1024}`; // Convert KB to bytes
      case "k":
        return `${value}`; // Already in KB
      case "m":
        return `${Math.round(value / 1024)}`; // Convert KB to MB
      case "g":
        return `${(value / 1024 / 1024).toFixed(1)}`; // Convert KB to GB
      case "h":
        // Human readable format with units
        if (value < 1024) {
          return `${value}K`;
        } else if (value < 1024 * 1024) {
          return `${(value / 1024).toFixed(1)}M`;
        } else {
          return `${(value / 1024 / 1024).toFixed(1)}G`;
        }
      default:
        return `${value}`;
    }
  }

  /**
   * Format the output based on the specified memory information and format
   */
  private formatOutput(
    memoryInfo: {
      total: number;
      used: number;
      free: number;
      shared: number;
      buffers: number;
      cache: number;
      available: number;
    },
    swapInfo: {
      total: number;
      used: number;
      free: number;
    },
    format: "b" | "k" | "m" | "g" | "h",
    wide: boolean
  ): string {
    // Format header based on format type
    let unit = "";
    switch (format) {
      case "b":
        unit = "bytes";
        break;
      case "k":
        unit = "kB";
        break;
      case "m":
        unit = "MB";
        break;
      case "g":
        unit = "GB";
        break;
      case "h":
        unit = "";
        break; // For human-readable, units are included with each value
    }

    const header = unit
      ? `              total        used        free      shared  buff/cache   available\n`
      : `                   total          used          free        shared    buff/cache     available\n`;

    // Format memory line
    const memLine = `Mem:${this.padLeft(
      this.formatValue(memoryInfo.total, format),
      unit,
      13
    )}${this.padLeft(
      this.formatValue(memoryInfo.used, format),
      unit,
      12
    )}${this.padLeft(
      this.formatValue(memoryInfo.free, format),
      unit,
      12
    )}${this.padLeft(
      this.formatValue(memoryInfo.shared, format),
      unit,
      12
    )}${this.padLeft(
      this.formatValue(memoryInfo.buffers + memoryInfo.cache, format),
      unit,
      12
    )}${this.padLeft(
      this.formatValue(memoryInfo.available, format),
      unit,
      12
    )}`;

    // Format swap line
    const swapLine = `Swap:${this.padLeft(
      this.formatValue(swapInfo.total, format),
      unit,
      12
    )}${this.padLeft(
      this.formatValue(swapInfo.used, format),
      unit,
      12
    )}${this.padLeft(this.formatValue(swapInfo.free, format), unit, 12)}${
      "          -" + " ".repeat(11) + "-"
    }`;

    return header + memLine + "\n" + swapLine;
  }

  /**
   * Pad a value with spaces to achieve desired width
   */
  private padLeft(value: string, unit: string, width: number): string {
    // If we have a unit suffix like 'M' or 'G', we need to handle it differently
    const unitSuffix = value.match(/[KMGTP]$/); // Match unit suffix
    const numericPart = unitSuffix ? value.slice(0, -1) : value;
    const suffix = unitSuffix ? unitSuffix[0] : unit;

    return (
      " ".repeat(Math.max(0, width - numericPart.length - suffix.length)) +
      numericPart +
      suffix
    );
  }
}
