import { NarrativeNode } from "../../NarrativeNode";

/**
 * Chapter 2: Digital Footprints
 *
 * The player undertakes their first real mission for GHOST//SIGNAL,
 * learning to cover their tracks in the digital world.
 *
 * This chapter focuses on teaching more advanced terminal commands
 * and builds on the basics from Chapter 1.
 */
export const chapter2Nodes: NarrativeNode[] = [
  // Chapter 2 Intro
  {
    id: "node_002_intro",
    type: "narrative",
    title: "Digital Sanctuary",
    content:
      "You've spent three days in GHOST//SIGNAL's hidden server cluster—what they call the 'Sanctuary.' Your neural implants have been upgraded with custom firmware that lets you perceive and interact with the quantum codebase more effectively.\n\nECHO, your assigned mentor, has been training you in basic command operations. You've learned how to navigate filesystems, read and write data, and manipulate permissions.\n\n\"Today, you graduate from simulations,\" ECHO says, her digital form shimmering with purpose. \"It's time for your first field operation.\"",
    chapterId: "chapter_002",
    choices: [
      {
        id: "choice_100_a",
        text: "\"I'm ready. What's the mission?\"",
        targetNode: "node_101_mission_briefing",
      },
      {
        id: "choice_100_b",
        text: '"I still have questions about my abilities."',
        targetNode: "node_102_more_training",
      },
    ],
    characters: ["char_002"],
    location: "ghost_signal_sanctuary",
    tags: ["chapter_start", "mission_prep"],
  },

  // Mission Briefing
  {
    id: "node_101_mission_briefing",
    type: "dialogue",
    title: "Operation: Digital Ghost",
    content:
      'ECHO brings up a holographic display showing a complex network topology. Data streams flow through it like blood vessels.\n\n"This is a PANOPTICON surveillance node in Sector 12. It\'s responsible for monitoring thousands of citizens, including several of our allies. Your mission is to access the node and erase all traces of our operatives from its databases."\n\nThe display zooms in on a specific junction point. "You\'ll need to establish a connection, navigate the security systems, locate the target records, and delete them without triggering alarms."\n\nShe gestures, and command examples appear in the air. "You\'ll need to use several of the commands you\'ve learned: ssh for connecting, ls and cd for navigation, grep to find the right files, and rm to remove them. Most importantly, you\'ll need to cover your tracks using history -c and editing log files."',
    chapterId: "chapter_002",
    choices: [
      {
        id: "choice_101_a",
        text: '"How do I get access to this system?"',
        targetNode: "node_103_access_method",
      },
      {
        id: "choice_101_b",
        text: '"What happens if I\'m detected?"',
        targetNode: "node_104_contingency",
      },
      {
        id: "choice_101_c",
        text: "\"I'm ready. Let's start the operation.\"",
        targetNode: "node_105_mission_start",
      },
    ],
    characters: ["char_002"],
    location: "ghost_signal_sanctuary",
    tags: ["mission_briefing", "exposition"],
  },

  // Mission Start - Connection with SSH
  {
    id: "node_105_mission_start",
    type: "narrative",
    title: "Secure Connection",
    content:
      "ECHO provides you with a set of credentials and an access point.\n\n\"This is where your journey begins,\" she says. \"Use the ssh command to connect to the surveillance node. Here's the command format you need to use:\"\n\nA floating command example appears before you:\n\n```\nssh operator@panopticon-12.gov\n```\n\n\"Once you're in, you'll need to navigate carefully. Remember everything you've learned. I'll maintain comms with you, but I won't be able to intervene directly if you trigger any alarms.\"",
    chapterId: "chapter_002",
    choices: [
      {
        id: "choice_105_a",
        text: "Connect to the system using ssh",
        targetNode: "node_106_system_access",
        requires_command: "ssh operator@panopticon-12.gov",
        metadata: {
          tooltipText:
            "Type the ssh command exactly as shown to connect to the system",
          commandChoice: true,
        },
      },
      {
        id: "choice_105_b",
        text: "Ask for more detailed instructions",
        targetNode: "node_107_detailed_instructions",
      },
    ],
    characters: ["char_002"],
    location: "ghost_signal_sanctuary",
    tags: ["mission_start", "connection", "ssh_tutorial"],
  },
];
