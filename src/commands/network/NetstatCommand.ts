import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

// Network connection types
enum ConnectionType {
  TCP = "tcp",
  UDP = "udp",
  UNIX = "unix",
}

// Network connection states
enum ConnectionState {
  ESTABLISHED = "ESTABLISHED",
  LISTEN = "LISTEN",
  CLOSED = "CLOSED",
  SYN_SENT = "SYN_SENT",
  SYN_RECV = "SYN_RECV",
  FIN_WAIT1 = "FIN_WAIT1",
  FIN_WAIT2 = "FIN_WAIT2",
  TIME_WAIT = "TIME_WAIT",
  CLOSE_WAIT = "CLOSE_WAIT",
  LAST_ACK = "LAST_ACK",
  CLOSING = "CLOSING",
}

// Interface for network connection record
interface NetworkConnection {
  protocol: ConnectionType;
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: ConnectionState;
  pid?: number;
  program?: string;
}

// Interface for network interface statistics
interface InterfaceStats {
  name: string;
  rxPackets: number;
  rxBytes: number;
  rxErrors: number;
  rxDropped: number;
  txPackets: number;
  txBytes: number;
  txErrors: number;
  txDropped: number;
  mtu: number;
  status: "UP" | "DOWN";
}

// Interface for routing table entry
interface RouteEntry {
  destination: string;
  gateway: string;
  netmask: string;
  flags: string;
  interface: string;
  metric: number;
}

/**
 * Print network connections, routing tables, interface statistics, masquerade connections,
 * and multicast memberships
 */
export class NetstatCommand implements Command {
  name = "netstat";
  aliases = ["ss"];
  category = CommandCategory.NETWORK;
  description =
    "Print network connections, routing tables, interface statistics";
  usage = "netstat [options]";
  examples = [
    "netstat",
    "netstat -a",
    "netstat -t",
    "netstat -u",
    "netstat -r",
    "netstat -i",
    "netstat -p",
    "netstat -n",
  ];
  skillLevel = SkillLevel.NETRUNNER;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    // Parse options
    const flags = {
      showAll: false, // -a: display all sockets
      showTcp: false, // -t: TCP sockets
      showUdp: false, // -u: UDP sockets
      showRouting: false, // -r: routing table
      showInterfaces: false, // -i: network interfaces
      showProcesses: false, // -p: process info
      numeric: false, // -n: don't resolve hostnames
      listening: false, // -l: show only listening sockets
      wide: false, // -W: don't truncate IP addresses
    };

    // Parse command-line arguments
    for (const arg of args) {
      if (arg.startsWith("-")) {
        // Remove the leading dash and process each character
        for (let i = 1; i < arg.length; i++) {
          const flag = arg[i];
          switch (flag) {
            case "a":
              flags.showAll = true;
              break;
            case "t":
              flags.showTcp = true;
              break;
            case "u":
              flags.showUdp = true;
              break;
            case "r":
              flags.showRouting = true;
              break;
            case "i":
              flags.showInterfaces = true;
              break;
            case "p":
              flags.showProcesses = true;
              break;
            case "n":
              flags.numeric = true;
              break;
            case "l":
              flags.listening = true;
              break;
            case "W":
              flags.wide = true;
              break;
            default:
              return {
                success: false,
                error: `Unknown option: -${flag}`,
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

    // Set default output type if none specified
    if (
      !flags.showTcp &&
      !flags.showUdp &&
      !flags.showRouting &&
      !flags.showInterfaces
    ) {
      flags.showTcp = true;
      flags.showUdp = true;
    }

    // Results accumulator
    const results: string[] = [];

    try {
      // Generate routing table output
      if (flags.showRouting) {
        results.push(
          this.formatRoutingTable(this.generateRoutingTable(), flags.numeric)
        );
      }

      // Generate interface statistics output
      if (flags.showInterfaces) {
        results.push(this.formatInterfaceStats(this.generateInterfaceStats()));
      }

      // Generate TCP connections
      if (flags.showTcp) {
        results.push(
          this.formatConnections(
            this.generateConnections(ConnectionType.TCP),
            ConnectionType.TCP,
            flags
          )
        );
      }

      // Generate UDP connections
      if (flags.showUdp) {
        results.push(
          this.formatConnections(
            this.generateConnections(ConnectionType.UDP),
            ConnectionType.UDP,
            flags
          )
        );
      }

      return {
        success: true,
        output: results.join("\n\n"),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during netstat execution",
      };
    }
  }

  /**
   * Generate simulated network connections
   */
  private generateConnections(type: ConnectionType): NetworkConnection[] {
    const connections: NetworkConnection[] = [];

    if (type === ConnectionType.TCP) {
      // Simulate some TCP connections
      connections.push({
        protocol: ConnectionType.TCP,
        localAddress: "127.0.0.1",
        localPort: 22,
        remoteAddress: "0.0.0.0",
        remotePort: 0,
        state: ConnectionState.LISTEN,
        pid: 1234,
        program: "sshd",
      });

      connections.push({
        protocol: ConnectionType.TCP,
        localAddress: "127.0.0.1",
        localPort: 80,
        remoteAddress: "0.0.0.0",
        remotePort: 0,
        state: ConnectionState.LISTEN,
        pid: 2345,
        program: "httpd",
      });

      connections.push({
        protocol: ConnectionType.TCP,
        localAddress: "192.168.1.5",
        localPort: 56789,
        remoteAddress: "35.158.87.12",
        remotePort: 443,
        state: ConnectionState.ESTABLISHED,
        pid: 3456,
        program: "chrome",
      });

      connections.push({
        protocol: ConnectionType.TCP,
        localAddress: "192.168.1.5",
        localPort: 56790,
        remoteAddress: "52.31.199.148",
        remotePort: 443,
        state: ConnectionState.ESTABLISHED,
        pid: 3456,
        program: "chrome",
      });

      connections.push({
        protocol: ConnectionType.TCP,
        localAddress: "192.168.1.5",
        localPort: 56791,
        remoteAddress: "140.82.121.4",
        remotePort: 22,
        state: ConnectionState.ESTABLISHED,
        pid: 4567,
        program: "ssh",
      });
    } else if (type === ConnectionType.UDP) {
      // Simulate some UDP connections
      connections.push({
        protocol: ConnectionType.UDP,
        localAddress: "0.0.0.0",
        localPort: 53,
        remoteAddress: "0.0.0.0",
        remotePort: 0,
        state: ConnectionState.LISTEN,
        pid: 5678,
        program: "named",
      });

      connections.push({
        protocol: ConnectionType.UDP,
        localAddress: "0.0.0.0",
        localPort: 67,
        remoteAddress: "0.0.0.0",
        remotePort: 0,
        state: ConnectionState.LISTEN,
        pid: 6789,
        program: "dhcpd",
      });

      connections.push({
        protocol: ConnectionType.UDP,
        localAddress: "127.0.0.1",
        localPort: 323,
        remoteAddress: "0.0.0.0",
        remotePort: 0,
        state: ConnectionState.LISTEN,
        pid: 7890,
        program: "chronyd",
      });

      connections.push({
        protocol: ConnectionType.UDP,
        localAddress: "192.168.1.5",
        localPort: 57621,
        remoteAddress: "8.8.8.8",
        remotePort: 53,
        state: ConnectionState.ESTABLISHED,
        pid: 8901,
        program: "systemd-resolve",
      });
    }

    return connections;
  }

  /**
   * Generate simulated network interface statistics
   */
  private generateInterfaceStats(): InterfaceStats[] {
    return [
      {
        name: "lo",
        rxPackets: 8234,
        rxBytes: 1586238,
        rxErrors: 0,
        rxDropped: 0,
        txPackets: 8234,
        txBytes: 1586238,
        txErrors: 0,
        txDropped: 0,
        mtu: 65536,
        status: "UP",
      },
      {
        name: "eth0",
        rxPackets: 95720,
        rxBytes: 127039618,
        rxErrors: 0,
        rxDropped: 0,
        txPackets: 41841,
        txBytes: 5127245,
        txErrors: 0,
        txDropped: 0,
        mtu: 1500,
        status: "UP",
      },
      {
        name: "wlan0",
        rxPackets: 148901,
        rxBytes: 203457892,
        rxErrors: 3,
        rxDropped: 5,
        txPackets: 79245,
        txBytes: 27893451,
        txErrors: 1,
        txDropped: 0,
        mtu: 1500,
        status: "UP",
      },
      {
        name: "docker0",
        rxPackets: 3781,
        rxBytes: 589124,
        rxErrors: 0,
        rxDropped: 0,
        txPackets: 6023,
        txBytes: 981276,
        txErrors: 0,
        txDropped: 0,
        mtu: 1500,
        status: "UP",
      },
    ];
  }

  /**
   * Generate simulated routing table
   */
  private generateRoutingTable(): RouteEntry[] {
    return [
      {
        destination: "0.0.0.0",
        gateway: "192.168.1.1",
        netmask: "0.0.0.0",
        flags: "UG",
        interface: "wlan0",
        metric: 600,
      },
      {
        destination: "127.0.0.0",
        gateway: "0.0.0.0",
        netmask: "255.0.0.0",
        flags: "U",
        interface: "lo",
        metric: 1000,
      },
      {
        destination: "172.17.0.0",
        gateway: "0.0.0.0",
        netmask: "255.255.0.0",
        flags: "U",
        interface: "docker0",
        metric: 0,
      },
      {
        destination: "192.168.1.0",
        gateway: "0.0.0.0",
        netmask: "255.255.255.0",
        flags: "U",
        interface: "wlan0",
        metric: 600,
      },
    ];
  }

  /**
   * Format network connections for display
   */
  private formatConnections(
    connections: NetworkConnection[],
    type: ConnectionType,
    flags: {
      showAll: boolean;
      showProcesses: boolean;
      numeric: boolean;
      listening: boolean;
      wide: boolean;
    }
  ): string {
    // Apply filters
    let filteredConnections = [...connections];

    if (flags.listening) {
      filteredConnections = filteredConnections.filter(
        (conn) => conn.state === ConnectionState.LISTEN
      );
    } else if (!flags.showAll) {
      // Default behavior: show only ESTABLISHED and LISTEN states
      filteredConnections = filteredConnections.filter(
        (conn) =>
          conn.state === ConnectionState.ESTABLISHED ||
          conn.state === ConnectionState.LISTEN
      );
    }

    // Format header
    const header =
      type === ConnectionType.TCP
        ? "Active Internet connections (servers and established)"
        : "Active Internet connections (only servers)";

    const columnHeader = flags.showProcesses
      ? "Proto  Recv-Q  Send-Q  Local Address          Foreign Address        State           PID/Program name"
      : "Proto  Recv-Q  Send-Q  Local Address          Foreign Address        State";

    // Format rows
    const rows = filteredConnections.map((conn) => {
      const localAddr = `${conn.localAddress}:${conn.localPort}`;
      const remoteAddr = `${conn.remoteAddress}:${conn.remotePort}`;

      let localPadded = localAddr;
      let remotePadded = remoteAddr;

      if (!flags.wide) {
        // Pad or truncate addresses to fit columns
        localPadded = localPadded.padEnd(22).substring(0, 22);
        remotePadded = remotePadded.padEnd(22).substring(0, 22);
      }

      const pidInfo = flags.showProcesses ? `${conn.pid}/${conn.program}` : "";

      return `${
        conn.protocol
      }    0       0       ${localPadded} ${remotePadded} ${conn.state.padEnd(
        15
      )} ${pidInfo}`;
    });

    return `${header}\n${columnHeader}\n${rows.join("\n")}`;
  }

  /**
   * Format interface statistics for display
   */
  private formatInterfaceStats(interfaces: InterfaceStats[]): string {
    const header = "Kernel Interface table";
    const columnHeader =
      "Iface      MTU    RX-OK  RX-ERR RX-DRP RX-OVR    TX-OK  TX-ERR TX-DRP TX-OVR Flg";

    const rows = interfaces.map((iface) => {
      return `${iface.name.padEnd(10)} ${String(iface.mtu).padEnd(6)} ${String(
        iface.rxPackets
      ).padEnd(7)} ${String(iface.rxErrors).padEnd(6)} ${String(
        iface.rxDropped
      ).padEnd(6)} 0       ${String(iface.txPackets).padEnd(7)} ${String(
        iface.txErrors
      ).padEnd(6)} ${String(iface.txDropped).padEnd(6)} 0       ${
        iface.status
      }`;
    });

    return `${header}\n${columnHeader}\n${rows.join("\n")}`;
  }

  /**
   * Format routing table for display
   */
  private formatRoutingTable(routes: RouteEntry[], numeric: boolean): string {
    const header = "Kernel IP routing table";
    const columnHeader =
      "Destination     Gateway         Genmask         Flags Metric Ref    Use Iface";

    const rows = routes.map((route) => {
      const dest = route.destination.padEnd(16);
      const gateway = route.gateway.padEnd(16);
      const netmask = route.netmask.padEnd(16);

      return `${dest} ${gateway} ${netmask} ${route.flags.padEnd(5)} ${String(
        route.metric
      ).padEnd(6)} 0      0   ${route.interface}`;
    });

    return `${header}\n${columnHeader}\n${rows.join("\n")}`;
  }
}
