import { NarrativeNode } from "../../NarrativeNode";

/**
 * Chapter 1: The Awakening
 *
 * This chapter introduces the player to the narrative system and the
 * basic terminal commands through an immersive cyberpunk story.
 *
 * Note on command-based choices:
 * Choices with the "requires_command" property need the player to actually
 * type the specified command in the terminal, rather than selecting a
 * numeric choice. This creates an interactive learning experience where
 * players practice real terminal commands within the narrative context.
 */
export const chapter1Nodes: NarrativeNode[] = [
  // Chapter 1: Initialization
  {
    id: "node_001_intro",
    type: "narrative",
    title: "Signal in the Noise",
    content:
      "Your neural interface blinks awake, bathing your dingy apartment in ghostly blue light. It's the third time this week you've been awakened by mysterious packet bursts coming through on frequencies that shouldn't exist.\n\n\"ATTENTION: CITIZEN #45601-B. QUANTUM SIGNATURE SCAN INDICATES POTENTIAL CHRONOS AFFINITY.\"\n\nThe message hovers in your field of vision, accompanied by a countdown timer. 30 seconds to respond.\n\n\"ACKNOWLEDGE WITH PHRASE: 'I SEE THE CODE BEHIND THE WORLD' TO PROCEED.\"",
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_001_a",
        text: "Respond with the phrase: 'I SEE THE CODE BEHIND THE WORLD'",
        targetNode: "node_002_contact",
      },
      {
        id: "choice_001_b",
        text: "Ignore the message and attempt to block the signal",
        targetNode: "node_003_ignore",
      },
    ],
    characters: [],
    location: "player_apartment",
    tags: ["intro", "tutorial"],
  },

  // First Contact
  {
    id: "node_002_contact",
    type: "dialogue",
    title: "First Contact",
    content:
      'The moment you subvocalize the phrase, the countdown freezes. Your neural interface flickers, and the blue light shifts to a pulsing emerald green.\n\n"CHRONOS AFFINITY CONFIRMED. ESTABLISHING SECURE CONNECTION..."\n\nThe message dissolves into fragments of code that swirl around you like digital fireflies. They coalesce into the form of a hooded figure projected in your room.\n\n"We don\'t have much time," the figure says, voice distorted. "PANOPTICON\'s reality engines detected your signature. My name is CIPHER, and I represent GHOST//SIGNAL. We are the resistance against those who would rewrite history itself."\n\nCIPHER\'s projection glances over their shoulder as if watching for something. "Your natural affinity for the Chronos Protocol makes you valuable—and a target. I can teach you to access the underlying structure of reality, but first you need to learn the basics of interfacing with the system."',
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_002_a",
        text: '"What are you talking about? What\'s the Chronos Protocol?"',
        targetNode: "node_004_explain_chronos",
      },
      {
        id: "choice_002_b",
        text: "\"How do I access this 'underlying structure of reality'?\"",
        targetNode: "node_005_first_command",
      },
      {
        id: "choice_002_c",
        text: '"PANOPTICON is tracking this connection. I want no part of this."',
        targetNode: "node_006_reject",
      },
    ],
    characters: ["char_001"],
    location: "player_apartment",
    tags: ["dialogue", "recruitment"],
  },

  // Ignoring the Call
  {
    id: "node_003_ignore",
    type: "narrative",
    title: "Blissful Ignorance",
    content:
      "You ignore the message, mentally activating your neural interface's security protocols to block the intrusion. The countdown continues to tick down, reaching zero...\n\nThe blue light fades. For a moment, you think you've successfully blocked the signal.\n\nThen your entire apartment's systems crash simultaneously. Lights, climate control, security—all offline. Through your window, you see the same is happening across the megablock housing complex. A city-wide system failure?\n\nYour neural interface reboots, displaying an emergency PANOPTICON alert:\n\n\"UNAUTHORIZED QUANTUM SIGNATURE DETECTED IN SECTOR 7. CONTAINMENT PROTOCOL ACTIVATED. PLEASE REMAIN IN YOUR RESIDENCE FOR MANDATORY SCANNING.\"\n\nHeavy boots echo in the corridor outside. They're coming for you.",
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_003_a",
        text: "Try to escape through the window",
        targetNode: "node_007_escape_attempt",
      },
      {
        id: "choice_003_b",
        text: "Hide and try to reestablish contact with the mysterious signal",
        targetNode: "node_008_reconnect",
      },
      {
        id: "choice_003_c",
        text: "Submit to the scanning procedure",
        targetNode: "node_009_captured",
      },
    ],
    characters: [],
    location: "player_apartment",
    tags: ["decision", "danger"],
  },

  // Explanation of Chronos Protocol
  {
    id: "node_004_explain_chronos",
    type: "dialogue",
    title: "The Nature of Reality",
    content:
      'CIPHER\'s projection walks toward your window, gesturing at the sprawling arcology of Neo-Shanghai beyond.\n\n"What if I told you all of this—everything you see, touch, and experience—is running on code? Not in the metaphorical sense philosophers have pondered for centuries, but literally. Reality is a quantum computational structure, a simulation of incomprehensible complexity."\n\nTheir hand waves, and for a split second, you see the cityscape dissolve into streams of symbols and equations before resoldering itself.\n\n"The Chronos Protocol is an ancient interface discovered in quantum archaeological digs. It allows direct manipulation of reality\'s source code. PANOPTICON uses it to maintain their version of history, erasing divergent timelines and dissent. But there are older commands, deeper access that they haven\'t managed to lock down. That\'s where we come in."\n\nCIPHER turns to you, their hooded face serious. "And now, you. Your quantum signature shows natural affinity for the Protocol. You can perceive the command line of reality itself."',
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_004_a",
        text: "\"Show me how to access this 'command line'\"",
        targetNode: "node_005_first_command",
      },
      {
        id: "choice_004_b",
        text: '"Why me? I\'m nobody special."',
        targetNode: "node_010_why_me",
      },
    ],
    characters: ["char_001"],
    location: "player_apartment",
    tags: ["exposition", "lore"],
  },

  // First Command - Teaching ls
  {
    id: "node_005_first_command",
    type: "dialogue",
    title: "The Language of Reality",
    content:
      'CIPHER nods, seemingly pleased with your response. They make a gesture in the air, and a glowing terminal window materializes between you.\n\n"This is the Interface. Your neural implants can access it now that I\'ve awakened your latent abilities. Think of it as the command line to reality itself."\n\nGreen text appears in the terminal:\n\n```\nCHRONOS://localhost > _\n```\n\n"Your first lesson," CIPHER continues. "To manipulate reality, you must first see what exists around you. Try entering the command \'ls\' - it\'s short for \'list segments\' in Chronos terminology. This will show you the current reality threads accessible to you."\n\nCIPHER looks over their shoulder again, concern evident even through their disguised voice. "Hurry. PANOPTICON\'s reality engines will have triangulated our connection soon."',
    chapterId: "chapter_001",
    effects: [
      {
        type: "set_flag",
        flag: "learned_ls_command",
      },
    ],
    choices: [
      {
        id: "choice_005_a",
        text: "Enter the command: ls",
        targetNode: "node_011_first_ls",
        requires_command: "ls",
        metadata: {
          tooltipText: "Type 'ls' directly in the terminal to proceed",
          commandChoice: true, // Custom metadata to indicate this is a command choice
        },
      },
      {
        id: "choice_005_b",
        text: '"This is insane. I don\'t believe any of this."',
        targetNode: "node_012_skeptical",
      },
    ],
    characters: ["char_001"],
    location: "player_apartment",
    tags: ["tutorial", "cli_basics"],
  },

  // Rejection Path
  {
    id: "node_006_reject",
    type: "dialogue",
    title: "Rejection",
    content:
      "CIPHER's hooded figure stands motionless for a moment.\n\n\"That's... unfortunate. But not unexpected. The truth is disorienting at first.\"\n\nThey raise a hand toward you. \"I respect your choice, but PANOPTICON doesn't offer the same courtesy. They've already detected your quantum signature. Whether you help us or not, they'll come for you.\"\n\nThe projection begins to fade. \"If you change your mind, use this emergency protocol. It may be your only chance.\"\n\nA string of complex symbols flashes before your eyes, burning into your memory as CIPHER's form dissolves completely.\n\nThirty seconds later, your apartment's power goes out. Through the walls, you hear the heavy footsteps of PANOPTICON enforcers moving through the corridor.",
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_006_a",
        text: "Try to escape through the window",
        targetNode: "node_007_escape_attempt",
      },
      {
        id: "choice_006_b",
        text: "Use the emergency protocol CIPHER provided",
        targetNode: "node_013_emergency_protocol",
      },
      {
        id: "choice_006_c",
        text: "Wait for the enforcers",
        targetNode: "node_009_captured",
      },
    ],
    characters: ["char_001"],
    location: "player_apartment",
    tags: ["decision", "danger"],
  },

  // First ls Command Result
  {
    id: "node_011_first_ls",
    type: "narrative",
    title: "Seeing Beyond",
    content:
      "Your thoughts form the command, and it appears in the floating terminal:\n\n```\nCHRONOS://localhost > ls\n```\n\nThe terminal responds immediately:\n\n```\npersonal/         - Your immediate timeline\nsystem/          - Core reality parameters\nnetwork/         - Connected quantum signatures\narchive/         - Temporal records (LOCKED)\ntools/           - Reality manipulation tools\n.panopticon      - Hidden surveillance instance\n```\n\nAs the results appear, your perception shifts momentarily. The walls of your apartment seem to become transparent, showing layers of code flowing beneath the physical surface of everything around you.\n\nCIPHER nods approvingly. \"Good. You're a natural. You've just glimpsed the file structure of your local reality instance. Every object, every moment, is accessible through the right commands.\"\n\nThe hooded figure points to the terminal. \"Now, let's explore your personal timeline. Use 'cd personal' to change your directory context to your own timeline.\"",
    chapterId: "chapter_001",
    effects: [
      {
        type: "set_flag",
        flag: "executed_first_command",
      },
    ],
    choices: [
      {
        id: "choice_011_a",
        text: "Enter command: cd personal",
        targetNode: "node_016_cd_personal",
        requires_command: "cd personal",
      },
      {
        id: "choice_011_b",
        text: "Enter command: cat .panopticon",
        targetNode: "node_017_check_surveillance",
        requires_command: "cat .panopticon",
      },
    ],
    characters: ["char_001"],
    location: "player_apartment",
    tags: ["cli_tutorial", "reality_perception"],
  },
];
