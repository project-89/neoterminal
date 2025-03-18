import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

// Network interface data structure
interface NetworkInterface {
  name: string;
  status: "UP" | "DOWN";
  mtu: number;
  ipv4: string;
  netmask: string;
  ipv6?: string;
  macAddress: string;
  rxPackets: number;
  txPackets: number;
  rxBytes: number;
  txBytes: number;
}

/**
 * Network interface configuration command
 */
export class IfconfigCommand implements Command {
  name = "ifconfig";
  aliases = ["ip", "ipconfig"];
  category = CommandCategory.NETWORK;
  description = "Configure network interface parameters";
  usage = "ifconfig [interface]";
  examples = ["ifconfig", "ifconfig eth0", "ifconfig lo"];
  skillLevel = SkillLevel.NETRUNNER;

  // Simulated network interfaces
  private interfaces: NetworkInterface[] = [
    {
      name: "eth0",
      status: "UP",
      mtu: 1500,
      ipv4: "192.168.1.105",
      netmask: "255.255.255.0",
      ipv6: "fe80::215:5dff:fe32:41c5",
      macAddress: "00:15:5d:32:41:c5",
      rxPackets: 2845623,
      txPackets: 1852304,
      rxBytes: 3718426534,
      txBytes: 176520145,
    },
    {
      name: "lo",
      status: "UP",
      mtu: 65536,
      ipv4: "127.0.0.1",
      netmask: "255.0.0.0",
      ipv6: "::1",
      macAddress: "00:00:00:00:00:00",
      rxPackets: 375682,
      txPackets: 375682,
      rxBytes: 28745231,
      txBytes: 28745231,
    },
    {
      name: "wlan0",
      status: "DOWN",
      mtu: 1500,
      ipv4: "",
      netmask: "",
      macAddress: "00:15:5d:8a:12:7b",
      rxPackets: 0,
      txPackets: 0,
      rxBytes: 0,
      txBytes: 0,
    },
  ];

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    try {
      // If an interface name is specified, show only that interface
      if (args.length > 0) {
        const interfaceName = args[0];
        const networkInterface = this.interfaces.find(
          (iface) => iface.name === interfaceName
        );

        if (!networkInterface) {
          return {
            success: false,
            error: `Interface ${interfaceName} not found`,
          };
        }

        return {
          success: true,
          output: this.formatInterface(networkInterface),
        };
      }

      // Otherwise, show all interfaces
      const output = this.interfaces
        .map((iface) => this.formatInterface(iface))
        .join("\n\n");

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

  /**
   * Format network interface information for display
   */
  private formatInterface(iface: NetworkInterface): string {
    let output = `${iface.name}: flags=${
      iface.status === "UP"
        ? "4163<UP,BROADCAST,RUNNING,MULTICAST>"
        : "4099<BROADCAST,MULTICAST>"
    } mtu ${iface.mtu}`;

    // Add IPv4 info if available
    if (iface.ipv4) {
      output += `\n        inet ${iface.ipv4}  netmask ${
        iface.netmask
      }  broadcast ${this.calculateBroadcast(iface.ipv4, iface.netmask)}`;
    }

    // Add IPv6 info if available
    if (iface.ipv6) {
      output += `\n        inet6 ${iface.ipv6}  prefixlen 64  scopeid 0x20<link>`;
    }

    // Add MAC address
    output += `\n        ether ${iface.macAddress}  txqueuelen 1000  (Ethernet)`;

    // Add traffic statistics
    output += `\n        RX packets ${iface.rxPackets}  bytes ${
      iface.rxBytes
    } (${this.formatBytes(iface.rxBytes)})`;
    output += `\n        TX packets ${iface.txPackets}  bytes ${
      iface.txBytes
    } (${this.formatBytes(iface.txBytes)})`;

    return output;
  }

  /**
   * Calculate broadcast address from IP and netmask
   */
  private calculateBroadcast(ipv4: string, netmask: string): string {
    // If no IP address, return empty string
    if (!ipv4) return "";

    const ipParts = ipv4.split(".").map(Number);
    const maskParts = netmask.split(".").map(Number);
    const broadcastParts = ipParts.map((part, i) => {
      // For the broadcast address, we OR the IP with the inverted netmask
      return part | (~maskParts[i] & 255);
    });

    return broadcastParts.join(".");
  }

  /**
   * Format bytes in human-readable format
   */
  private formatBytes(bytes: number): string {
    const units = ["B", "KiB", "MiB", "GiB", "TiB"];
    let unitIndex = 0;
    let value = bytes;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }
}
