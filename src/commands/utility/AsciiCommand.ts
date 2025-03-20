import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { CommandUtils } from "../../utils/CommandUtils";
import { asciiArtRenderer, AsciiArtOptions } from "../../ascii";
import chalk from "chalk";
import themeManager from "../../terminal/themes/ThemeManager";

/**
 * Command for viewing and using ASCII art
 */
export class AsciiCommand implements Command {
  name = "ascii";
  aliases = ["art"];
  category = CommandCategory.UTILITY;
  description = "Display ASCII art";
  usage = "ascii [options] <art_name>";
  examples = [
    "ascii list",
    "ascii list cyberpunk",
    "ascii list mission",
    "ascii terminal_logo",
    "ascii skull --color red",
    "ascii hacker --rainbow",
    "ascii robot --border",
    "ascii city_skyline --glitch",
  ];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { terminal } = options;
    const palette = themeManager.getColorPalette();

    // If no arguments provided, display help
    if (args.length === 0) {
      return {
        success: true,
        output: `Usage: ${this.usage}\nRun "ascii list" to see available art.`,
      };
    }

    const command = args[0].toLowerCase();

    // List available ASCII art
    if (command === "list") {
      let category: "cyberpunk" | "mission" | "custom" | undefined = undefined;

      if (args.length > 1) {
        const categoryArg = args[1].toLowerCase();
        if (["cyberpunk", "mission", "custom"].includes(categoryArg)) {
          category = categoryArg as "cyberpunk" | "mission" | "custom";
        }
      }

      return this.listAsciiArt(category);
    }

    // Parse options for rendering
    const artOptions: AsciiArtOptions = {};
    let artName = command;

    // Process command line options
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith("--")) {
        const option = arg.slice(2).toLowerCase();

        switch (option) {
          case "color":
            if (i + 1 < args.length) {
              artOptions.color = args[++i];
            }
            break;
          case "border":
            artOptions.border = true;
            break;
          case "center":
            artOptions.center = true;
            if (terminal) {
              artOptions.centerWidth = terminal.getDimensions().cols;
            } else {
              artOptions.centerWidth = 80; // Default width
            }
            break;
          case "glitch":
            artOptions.glitch = true;
            if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
              const intensity = parseFloat(args[++i]);
              if (!isNaN(intensity) && intensity >= 0 && intensity <= 1) {
                artOptions.glitchIntensity = intensity;
              }
            } else {
              artOptions.glitchIntensity = 0.3; // Default intensity
            }
            break;
          case "fade":
          case "fadeout":
            artOptions.fadeOut = true;
            break;
          case "rainbow":
            artOptions.rainbow = true;
            break;
          default:
            // Unknown option, ignore
            break;
        }
      } else if (i === 1) {
        // First non-option argument is the art name
        artName = arg;
      }
    }

    // Render the art
    const renderedArt = asciiArtRenderer.render(artName, artOptions);

    if (!renderedArt) {
      return {
        success: false,
        error: `ASCII art not found: ${artName}`,
        output: CommandUtils.error(`ASCII art not found: ${artName}`),
      };
    }

    return {
      success: true,
      output: renderedArt.styled,
    };
  }

  /**
   * List available ASCII art categories or art within a category
   * @param category Optional category to filter by
   */
  private listAsciiArt(
    category?: "cyberpunk" | "mission" | "custom"
  ): CommandResult {
    const palette = themeManager.getColorPalette();
    const availableArt = asciiArtRenderer.getAvailableArt(category);

    if (availableArt.length === 0) {
      return {
        success: true,
        output: CommandUtils.secondary(
          "No ASCII art available in this category."
        ),
      };
    }

    let title = "All ASCII Art";
    if (category === "cyberpunk") {
      title = "Cyberpunk ASCII Art";
    } else if (category === "mission") {
      title = "Mission ASCII Art";
    } else if (category === "custom") {
      title = "Custom ASCII Art";
    }

    const rows = [
      CommandUtils.primary(title),
      CommandUtils.secondary("=".repeat(title.length)),
      "",
    ];

    // Group by first letter for better organization
    const groupedArt = availableArt.reduce((acc, name) => {
      const firstLetter = name.charAt(0).toUpperCase();
      acc[firstLetter] = acc[firstLetter] || [];
      acc[firstLetter].push(name);
      return acc;
    }, {} as Record<string, string[]>);

    const sortedLetters = Object.keys(groupedArt).sort();

    for (const letter of sortedLetters) {
      rows.push(CommandUtils.accent(`${letter}:`));

      // Sort names within each group
      const names = groupedArt[letter].sort();

      // Format in columns (3 per row)
      const columns = [];
      for (let i = 0; i < names.length; i += 3) {
        const row = [];
        for (let j = 0; j < 3 && i + j < names.length; j++) {
          row.push(CommandUtils.secondary(names[i + j].padEnd(20)));
        }
        columns.push(`  ${row.join("")}`);
      }

      rows.push(...columns, "");
    }

    rows.push(
      CommandUtils.primary("Usage:"),
      `  ${CommandUtils.secondary("ascii <name>")} - Display ASCII art`,
      `  ${CommandUtils.secondary(
        "ascii <name> --color <color>"
      )} - Display with specified color`,
      `  ${CommandUtils.secondary(
        "ascii <name> --border"
      )} - Display with a border`,
      `  ${CommandUtils.secondary(
        "ascii <name> --glitch [intensity]"
      )} - Apply glitch effect`,
      `  ${CommandUtils.secondary(
        "ascii <name> --rainbow"
      )} - Display with rainbow colors`,
      `  ${CommandUtils.secondary(
        "ascii <name> --fadeout"
      )} - Fade out the bottom of the art`,
      `  ${CommandUtils.secondary(
        "ascii <name> --center"
      )} - Center the art in terminal`,
      ""
    );

    return {
      success: true,
      output: rows.join("\n"),
    };
  }
}
