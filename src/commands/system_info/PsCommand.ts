import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

// Process data structure
interface Process {
  pid: number;
  user: string;
  state: string;
  cpu: number;
  memory: number;
  start: string;
  command: string;
}

/**
 * Process status command
 */
export class PsCommand implements Command {
  name = "ps";
  aliases = [];
  category = CommandCategory.SYSTEM_INFO;
  description = "Report process status";
  usage = "ps [options]";
  examples = ["ps", "ps -a", "ps -aux"];
  skillLevel = SkillLevel.NETRUNNER;

  // Simulated processes that will always be shown
  private systemProcesses: Process[] = [
    {
      pid: 1,
      user: "root",
      state: "S",
      cpu: 0.0,
      memory: 0.1,
      start: "00:00",
      command: "/sbin/init",
    },
    {
      pid: 2,
      user: "root",
      state: "S",
      cpu: 0.0,
      memory: 0.0,
      start: "00:00",
      command: "[kthreadd]",
    },
    {
      pid: 145,
      user: "root",
      state: "S",
      cpu: 0.0,
      memory: 0.5,
      start: "00:00",
      command: "/usr/sbin/sshd -D",
    },
    {
      pid: 288,
      user: "user",
      state: "S",
      cpu: 0.0,
      memory: 0.3,
      start: "00:05",
      command: "bash",
    },
    {
      pid: 312,
      user: "user",
      state: "R",
      cpu: 1.2,
      memory: 1.5,
      start: "00:10",
      command: "neoterminal",
    },
  ];

  // User processes that will be shown with the -a flag
  private userProcesses: Process[] = [
    {
      pid: 402,
      user: "user",
      state: "S",
      cpu: 0.1,
      memory: 0.8,
      start: "00:15",
      command: "vim config.json",
    },
    {
      pid: 435,
      user: "user",
      state: "S",
      cpu: 0.0,
      memory: 0.2,
      start: "00:18",
      command: "tail -f logs/system.log",
    },
    {
      pid: 482,
      user: "user",
      state: "Z",
      cpu: 0.0,
      memory: 0.0,
      start: "00:22",
      command: "[defunct]",
    },
  ];

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    try {
      // Parse flags
      let showAll = false;
      let detailedFormat = false;

      for (const arg of args) {
        if (arg.startsWith("-")) {
          if (arg.includes("a")) showAll = true;
          if (arg.includes("u") || arg.includes("l")) detailedFormat = true;
          if (arg === "-aux" || arg === "-a -u" || arg === "-a -u -x") {
            showAll = true;
            detailedFormat = true;
          }
        }
      }

      // Determine which processes to show
      let processes = [...this.systemProcesses];

      if (showAll) {
        processes = processes.concat(this.userProcesses);
      }

      // Format output
      let output: string;

      if (detailedFormat) {
        // Detailed format like ps aux
        output =
          "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n";
        output += processes
          .map(
            (p) =>
              `${p.user.padEnd(10)} ${p.pid.toString().padStart(4)} ${p.cpu
                .toFixed(1)
                .padStart(4)} ${p.memory.toFixed(1).padStart(4)} ${Math.round(
                p.memory * 10000
              )
                .toString()
                .padStart(5)} ${Math.round(p.memory * 1000)
                .toString()
                .padStart(5)} pts/0    ${p.state}    ${p.start}   0:00 ${
                p.command
              }`
          )
          .join("\n");
      } else {
        // Simple format like ps
        output = "  PID TTY          TIME CMD\n";
        output += processes
          .map(
            (p) =>
              `${p.pid.toString().padStart(5)} pts/0     00:00:00 ${
                p.command.split(" ")[0]
              }`
          )
          .join("\n");
      }

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
