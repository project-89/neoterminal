import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualFile } from "../../filesystem/VirtualNodes";

/**
 * Pattern scanning and processing language
 */
export class AwkCommand implements Command {
  name = "awk";
  aliases = ["gawk"];
  category = CommandCategory.TEXT_PROCESSING;
  description = "Pattern scanning and processing language";
  usage = "awk [options] 'program' [file...]";
  examples = [
    "awk '{print $1}' file.txt",
    "awk '/pattern/' file.txt",
    "awk -F: '{print $1}' /etc/passwd",
    "awk '{sum+=$1} END {print sum}' numbers.txt",
    'awk \'BEGIN {print "Header"} {print} END {print "Footer"}\' file.txt',
  ];
  skillLevel = SkillLevel.ARCHITECT;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // Parse options
    let fieldSeparator = " ";
    let program = "";
    const files: string[] = [];

    let i = 0;
    while (i < args.length) {
      const arg = args[i];

      if (arg === "-F" || arg === "--field-separator") {
        if (i + 1 >= args.length) {
          return {
            success: false,
            error: `Option ${arg} requires an argument`,
          };
        }
        fieldSeparator = args[i + 1];
        i += 2;
      } else if (arg.startsWith("-F")) {
        // Handle -F: directly
        fieldSeparator = arg.substring(2);
        i++;
      } else if (arg.startsWith("-")) {
        return {
          success: false,
          error: `Unknown option: ${arg}`,
        };
      } else {
        // If no program has been provided yet, this must be the program
        if (!program) {
          program = arg;
        } else {
          // Otherwise it's a filename
          files.push(arg);
        }
        i++;
      }
    }

    if (!program) {
      return {
        success: false,
        error: "No program specified",
      };
    }

    // If no files specified, use standard input (not implemented in this simulation)
    if (files.length === 0) {
      return {
        success: false,
        error:
          "No input files specified. Reading from stdin is not supported yet.",
      };
    }

    try {
      // Parse the program
      const awkProgram = this.parseAwkProgram(program);

      if (!awkProgram) {
        return {
          success: false,
          error: "Failed to parse awk program",
        };
      }

      // Process each file
      const results: string[] = [];
      let hadErrors = false;

      // Execute BEGIN blocks first, if any
      if (awkProgram.beginActions.length > 0) {
        const context: AwkContext = {
          variables: new Map(),
          fieldSeparator,
          currentFile: "",
          lineNumber: 0,
        };

        for (const action of awkProgram.beginActions) {
          const actionResult = this.executeAction(action, [], context);
          if (actionResult) {
            results.push(actionResult);
          }
        }
      }

      // Process files
      for (const filePath of files) {
        const resolvedPath = filesystem.resolvePath(filePath);
        const node = filesystem.getNode(resolvedPath);

        if (!node) {
          results.push(`awk: ${filePath}: No such file or directory`);
          hadErrors = true;
          continue;
        }

        if (!(node instanceof VirtualFile)) {
          results.push(`awk: ${filePath}: Is a directory`);
          hadErrors = true;
          continue;
        }

        const fileContent = node.getContent().toString();
        const lines = fileContent.split("\n");

        // Set up the execution context
        const context: AwkContext = {
          variables: new Map(),
          fieldSeparator,
          currentFile: filePath,
          lineNumber: 0,
        };

        // Process each line
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          context.lineNumber = lineIndex + 1;

          const fields = line
            .split(fieldSeparator)
            .filter((field) => field.length > 0);

          // Execute pattern/action blocks that match
          for (const { pattern, action } of awkProgram.patterns) {
            // If no pattern, the action applies to all lines
            if (!pattern || this.matchesPattern(pattern, line, context)) {
              const actionResult = this.executeAction(action, fields, context);
              if (actionResult) {
                results.push(actionResult);
              }
            }
          }
        }
      }

      // Execute END blocks, if any
      if (awkProgram.endActions.length > 0) {
        const context: AwkContext = {
          variables: new Map(),
          fieldSeparator,
          currentFile: "",
          lineNumber: 0,
        };

        for (const action of awkProgram.endActions) {
          const actionResult = this.executeAction(action, [], context);
          if (actionResult) {
            results.push(actionResult);
          }
        }
      }

      return {
        success: !hadErrors,
        output: results.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during awk execution",
      };
    }
  }

  /**
   * Parse an awk program string into a structured representation
   */
  private parseAwkProgram(programStr: string): AwkProgram | null {
    const program: AwkProgram = {
      beginActions: [],
      endActions: [],
      patterns: [],
    };

    try {
      // Split on sections defined by { ... }
      let currentIndex = 0;
      let braceLevel = 0;
      let patternStart = 0;
      let actionStart = 0;

      while (currentIndex < programStr.length) {
        const char = programStr[currentIndex];

        if (char === "{") {
          if (braceLevel === 0) {
            // Start of an action block
            const pattern = programStr
              .substring(patternStart, currentIndex)
              .trim();
            actionStart = currentIndex + 1;

            // Check for BEGIN or END
            if (pattern === "BEGIN") {
              program.beginActions.push(""); // Placeholder
            } else if (pattern === "END") {
              program.endActions.push(""); // Placeholder
            } else if (pattern) {
              program.patterns.push({ pattern, action: "" }); // Placeholder
            } else {
              program.patterns.push({ action: "" }); // No pattern
            }
          }
          braceLevel++;
        } else if (char === "}") {
          braceLevel--;
          if (braceLevel === 0) {
            // End of an action block
            const action = programStr
              .substring(actionStart, currentIndex)
              .trim();

            // Update the appropriate action
            const pattern = programStr
              .substring(patternStart, actionStart - 1)
              .trim();
            if (pattern === "BEGIN") {
              program.beginActions[program.beginActions.length - 1] = action;
            } else if (pattern === "END") {
              program.endActions[program.endActions.length - 1] = action;
            } else {
              // Regular pattern/action
              const lastPattern = program.patterns[program.patterns.length - 1];
              if (lastPattern && lastPattern.action === "") {
                lastPattern.action = action;
              }
            }

            patternStart = currentIndex + 1;
          }
        }

        currentIndex++;
      }

      return program;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a line matches a pattern
   */
  private matchesPattern(
    pattern: string,
    line: string,
    context: AwkContext
  ): boolean {
    // Regular expression pattern
    if (pattern.startsWith("/") && pattern.endsWith("/")) {
      const regexPattern = pattern.substring(1, pattern.length - 1);
      try {
        const regex = new RegExp(regexPattern);
        return regex.test(line);
      } catch (error) {
        return false;
      }
    }

    // TODO: Support more pattern types like:
    // - expr ~ /regex/
    // - expr !~ /regex/
    // - expr1, expr2 (range patterns)
    // - Boolean expressions

    return false;
  }

  /**
   * Execute an awk action on a line
   */
  private executeAction(
    action: string,
    fields: string[],
    context: AwkContext
  ): string | null {
    // Very basic implementation focusing primarily on print actions

    // Handle print statement
    if (action.startsWith("print ")) {
      return this.handlePrint(action.substring(6), fields, context);
    } else if (action === "print") {
      // Print the whole line (represented by $0)
      return fields.join(context.fieldSeparator);
    }

    // Handle variable assignment
    const assignMatch = action.match(/([\w]+)\s*=\s*(.+)/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const valueExpr = assignMatch[2];

      // Very basic expression evaluation
      let value: string | number = this.evaluateExpression(
        valueExpr,
        fields,
        context
      );

      // Store variable
      context.variables.set(varName, value);
      return null; // Assignments don't produce output
    }

    // For simplicity, just return null for other actions
    // A full awk implementation would need a complete expression parser and evaluator
    return null;
  }

  /**
   * Handle print statements
   */
  private handlePrint(
    args: string,
    fields: string[],
    context: AwkContext
  ): string {
    // Split arguments by comma
    const printArgs = args.split(",").map((arg) => arg.trim());

    // Evaluate each argument and join with space
    return printArgs
      .map((arg) => this.evaluateExpression(arg, fields, context).toString())
      .join(" ");
  }

  /**
   * Evaluate a simple awk expression
   */
  private evaluateExpression(
    expr: string,
    fields: string[],
    context: AwkContext
  ): string | number {
    // Field reference ($0, $1, $2, etc.)
    if (expr.startsWith("$")) {
      const fieldNum = expr.substring(1);

      if (fieldNum === "0") {
        return fields.join(context.fieldSeparator);
      }

      const index = parseInt(fieldNum, 10);
      if (!isNaN(index) && index > 0 && index <= fields.length) {
        return fields[index - 1];
      }
      return "";
    }

    // Variable reference
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) {
      if (expr === "NR") {
        return context.lineNumber;
      }

      if (expr === "FILENAME") {
        return context.currentFile;
      }

      return context.variables.get(expr) || "";
    }

    // String literal
    if (
      (expr.startsWith('"') && expr.endsWith('"')) ||
      (expr.startsWith("'") && expr.endsWith("'"))
    ) {
      return expr.substring(1, expr.length - 1);
    }

    // Number
    const num = parseFloat(expr);
    if (!isNaN(num)) {
      return num;
    }

    // For simplicity, just return the expression as-is for unhandled cases
    return expr;
  }
}

/**
 * Types for awk implementation
 */
interface AwkProgram {
  beginActions: string[];
  endActions: string[];
  patterns: Array<{
    pattern?: string;
    action: string;
  }>;
}

interface AwkContext {
  variables: Map<string, string | number>;
  fieldSeparator: string;
  currentFile: string;
  lineNumber: number;
}
