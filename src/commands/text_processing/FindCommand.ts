import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import {
  VirtualFile,
  VirtualNode,
  VirtualDirectory,
} from "../../filesystem/VirtualNodes";

/**
 * Find command for locating files and directories
 */
export class FindCommand implements Command {
  name = "find";
  aliases = ["locate"];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Search for files in a directory hierarchy";
  usage = "find [path...] [expression]";
  examples = [
    "find /home -name '*.txt'",
    "find . -type f",
    "find /var -type d -name 'log*'",
  ];
  skillLevel = SkillLevel.NETRUNNER;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Set default path to current directory if not specified
    let paths: string[] = [];
    let namePattern: string | null = null;
    let typeFilter: string | null = null;
    let i = 0;

    // Parse arguments
    while (i < args.length) {
      if (args[i] === "-name" && i + 1 < args.length) {
        namePattern = args[i + 1];
        i += 2;
      } else if (args[i] === "-type" && i + 1 < args.length) {
        typeFilter = args[i + 1];
        i += 2;
      } else if (!args[i].startsWith("-")) {
        paths.push(args[i]);
        i++;
      } else {
        // Skip unsupported options
        i++;
      }
    }

    // If no paths specified, use current directory
    if (paths.length === 0) {
      paths.push(filesystem.getCurrentPath());
    }

    try {
      let results: string[] = [];

      // Convert name pattern to regex if specified
      const nameRegex = namePattern
        ? new RegExp(
            "^" +
              namePattern
                .replace(/\./g, "\\.")
                .replace(/\*/g, ".*")
                .replace(/\?/g, ".") +
              "$"
          )
        : null;

      // Search in each specified path
      for (const path of paths) {
        const foundPaths = await this.findRecursively(
          filesystem,
          path,
          nameRegex,
          typeFilter
        );
        results = results.concat(foundPaths);
      }

      if (results.length === 0) {
        return {
          success: true,
          output: "No matching files or directories found",
        };
      }

      return {
        success: true,
        output: results.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Find files and directories recursively
   */
  private async findRecursively(
    filesystem: any,
    path: string,
    namePattern: RegExp | null,
    typeFilter: string | null
  ): Promise<string[]> {
    const results: string[] = [];
    try {
      const node = filesystem.getNode(path);

      if (!node) {
        throw new Error(`Path not found: ${path}`);
      }

      // Check if current node matches criteria
      if (this.matchesPattern(node, path, namePattern, typeFilter)) {
        results.push(path);
      }

      // If this is a directory, search its contents
      if (node instanceof VirtualDirectory) {
        const contents = filesystem.listDirectory(path);

        for (const childNode of contents) {
          const childPath = `${path === "/" ? "" : path}/${childNode.name}`;
          const childResults = await this.findRecursively(
            filesystem,
            childPath,
            namePattern,
            typeFilter
          );
          results.push(...childResults);
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a node matches the search criteria
   */
  private matchesPattern(
    node: VirtualNode,
    path: string,
    namePattern: RegExp | null,
    typeFilter: string | null
  ): boolean {
    // Get the basename of the path
    const basename = path.split("/").pop() || "";

    // Check name pattern
    if (namePattern && !namePattern.test(basename)) {
      return false;
    }

    // Check type filter
    if (typeFilter) {
      if (typeFilter === "f" && !(node instanceof VirtualFile)) {
        return false;
      }
      if (typeFilter === "d" && !(node instanceof VirtualDirectory)) {
        return false;
      }
    }

    return true;
  }
}
