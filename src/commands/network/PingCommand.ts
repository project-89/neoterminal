import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

/**
 * Ping command to test network connectivity
 */
export class PingCommand implements Command {
  name = "ping";
  aliases = [];
  category = CommandCategory.NETWORK;
  description = "Send ICMP ECHO_REQUEST to network hosts";
  usage = "ping [options] destination";
  examples = [
    "ping google.com",
    "ping -c 5 192.168.1.1",
    "ping -c 3 -i 2 localhost",
  ];
  skillLevel = SkillLevel.OPERATOR;

  // Default settings
  private defaultCount = 4;
  private defaultInterval = 1;
  private defaultTimeout = 1;

  // Known hosts with simulated latency
  private knownHosts: Map<string, { latency: number; packetLoss: number }> =
    new Map([
      ["localhost", { latency: 0.05, packetLoss: 0 }],
      ["127.0.0.1", { latency: 0.05, packetLoss: 0 }],
      ["192.168.1.1", { latency: 1.5, packetLoss: 0 }],
      ["192.168.1.105", { latency: 0.2, packetLoss: 0 }],
      ["google.com", { latency: 25, packetLoss: 0.05 }],
      ["github.com", { latency: 35, packetLoss: 0.1 }],
      ["cloudflare.com", { latency: 15, packetLoss: 0.02 }],
      ["example.com", { latency: 50, packetLoss: 0.15 }],
      ["badhost.local", { latency: 0, packetLoss: 1 }], // 100% packet loss
    ]);

  // Default host if unrecognized
  private defaultLatency = 100;
  private defaultPacketLoss = 0.2;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    try {
      if (args.length === 0) {
        return {
          success: false,
          error: "Usage: ping [options] destination",
        };
      }

      // Parse options
      let count = this.defaultCount;
      let interval = this.defaultInterval;
      let timeout = this.defaultTimeout;
      let destination = "";

      let i = 0;
      while (i < args.length) {
        if (args[i] === "-c" && i + 1 < args.length) {
          count = parseInt(args[i + 1]);
          if (isNaN(count) || count <= 0) {
            return {
              success: false,
              error: "Invalid count value",
            };
          }
          i += 2;
        } else if (args[i] === "-i" && i + 1 < args.length) {
          interval = parseFloat(args[i + 1]);
          if (isNaN(interval) || interval <= 0) {
            return {
              success: false,
              error: "Invalid interval value",
            };
          }
          i += 2;
        } else if (args[i] === "-W" && i + 1 < args.length) {
          timeout = parseFloat(args[i + 1]);
          if (isNaN(timeout) || timeout <= 0) {
            return {
              success: false,
              error: "Invalid timeout value",
            };
          }
          i += 2;
        } else if (!args[i].startsWith("-")) {
          destination = args[i];
          i++;
        } else {
          // Skip unknown options
          i++;
        }
      }

      if (!destination) {
        return {
          success: false,
          error: "No destination specified",
        };
      }

      // Simulate ping responses
      const hostInfo = this.knownHosts.get(destination) || {
        latency: this.defaultLatency,
        packetLoss: this.defaultPacketLoss,
      };

      // Start ping simulation
      const output: string[] = [
        `PING ${destination} (${this.simulateIP(destination)}): 56 data bytes`,
      ];

      let successfulPings = 0;
      let totalLatency = 0;
      let minLatency = Number.MAX_VALUE;
      let maxLatency = 0;

      for (let i = 0; i < count; i++) {
        // Simulate packet loss
        if (Math.random() < hostInfo.packetLoss) {
          output.push(`Request timeout for icmp_seq ${i + 1}`);
          continue;
        }

        // Generate slightly variable latency
        const jitter = (Math.random() * 0.2 - 0.1) * hostInfo.latency;
        const pingLatency = Math.max(0.1, hostInfo.latency + jitter);

        totalLatency += pingLatency;
        minLatency = Math.min(minLatency, pingLatency);
        maxLatency = Math.max(maxLatency, pingLatency);
        successfulPings++;

        output.push(
          `64 bytes from ${this.simulateIP(destination)}: icmp_seq=${
            i + 1
          } ttl=64 time=${pingLatency.toFixed(3)} ms`
        );
      }

      // Print statistics
      if (successfulPings > 0) {
        const avgLatency = totalLatency / successfulPings;
        const packetLoss = ((count - successfulPings) / count) * 100;

        output.push("");
        output.push(`--- ${destination} ping statistics ---`);
        output.push(
          `${count} packets transmitted, ${successfulPings} packets received, ${packetLoss.toFixed(
            1
          )}% packet loss`
        );
        output.push(
          `round-trip min/avg/max = ${minLatency.toFixed(
            3
          )}/${avgLatency.toFixed(3)}/${maxLatency.toFixed(3)} ms`
        );
      } else {
        output.push("");
        output.push(`--- ${destination} ping statistics ---`);
        output.push(
          `${count} packets transmitted, 0 packets received, 100.0% packet loss`
        );
      }

      return {
        success: true,
        output: output.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate a plausible IP address for a destination
   */
  private simulateIP(destination: string): string {
    if (destination === "localhost") return "127.0.0.1";
    if (destination.match(/^\d+\.\d+\.\d+\.\d+$/)) return destination;

    // Generate a consistent but random looking IP for domains
    const hash = this.simpleHash(destination);
    return `${(hash % 223) + 1}.${(hash >> 8) % 255}.${(hash >> 16) % 255}.${
      ((hash >> 24) % 254) + 1
    }`;
  }

  /**
   * Simple string hashing function
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
