import { NarrativeNode } from "../nodes/NarrativeNode";

/**
 * Initial nodes for Chapter 1: The Awakening
 */
export const chapter1Nodes: NarrativeNode[] = [
  // Introduction node
  {
    id: "node_001_intro",
    title: "An Unexpected Message",
    content: `Your neural interface flickers with an incoming message, the encrypted notification pulsing at the edge of your augmented vision. Strange—you weren't expecting any communications on this secure sub-channel.
    
    "ATTENTION: CITIZEN #45601-B. YOUR DIGITAL FOOTPRINT HAS BEEN FLAGGED FOR REVIEW."
    
    The message freezes your blood. A PANOPTICON notice—the ubiquitous surveillance AI that monitors all digital activity across NeoTokyo. Your neural implant registers an involuntary spike in your heart rate.
    
    Before you can process your thoughts, the message glitches, digital artifacts corrupting the PANOPTICON sigil before resolving into new text:
    
    "DISREGARD PREVIOUS MESSAGE. SECURE CONNECTION ESTABLISHED. 
    [2048-BIT ENCRYPTION ACTIVE]
    
    We've been watching you. Your node-jumping skills are impressive. Not many can bypass a level-3 security subnet without leaving digital traces. But PANOPTICON is watching too. Their neural pattern recognition has flagged your recent activities. Soon, their extraction teams will find you.
    
    We can help. We are GHOST//SIGNAL. 
    
    If you're interested in freedom, reply to this message with: 'I SEE THE GHOST IN THE SIGNAL'
    
    You have 30 seconds to decide."
    
    The quantum-encrypted message bears no digital signature, but your black-market trace software can't detect any surveillance hooks. Your pulse quickens as your augmented reality display shows a countdown timer in your peripheral vision. Is this a trap or your only way out?`,
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_001_a",
        text: "Reply with the phrase: 'I SEE THE GHOST IN THE SIGNAL'",
        nextNodeId: "node_001_reply",
        isVisible: true,
      },
      {
        id: "choice_001_b",
        text: "Ignore the message and disconnect from your neural interface",
        nextNodeId: "node_001_ignore",
        isVisible: true,
      },
    ],
    metadata: {
      background: "apartment_night",
      music: "tension_ambient_01",
      isSpecialNode: true,
    },
  },

  // Reply path
  {
    id: "node_001_reply",
    title: "Contact Established",
    content: `You subvocalize the phrase, your neural interface translating the thought-patterns into the text command. Your fingers trembled slightly as you mentally pressed 'send' through your augmented reality interface.
    
    Your AR display glitches, the entire field of vision fragmenting into digital artifacts. For a moment, your neural connection showed complete disconnection—was it a trap after all?
    
    Then, new text formed in your vision, bypassing your normal communication filters:
    
    "Connection secured. Quantum handshake complete. We're glad you made the right choice. PANOPTICON had your neural signature and residence flagged for a black-bag extraction in the next 48 hours. We've spoofed their tracking algorithms temporarily, but you need to relocate before their next system-wide sync.
    
    Take only what you need—nothing with a biometric lock or network capability. A courier will meet you at Nexus Plaza, bench #7, in one hour. They'll be carrying a blue data-slate with a physical switch. The verification phrase is 'The walls have too many eyes.'
    
    Wipe this message from your neural cache when you're done.
    
    - CIPHER"
    
    Your AR interface showed a small alert: "Unknown program has disabled your neural tracking beacon."`,
    chapterId: "chapter_001",
    speakerId: "char_001",
    choices: [
      {
        id: "choice_001_d",
        text: "Pack essential items and head to Nexus Plaza",
        nextNodeId: "node_001_plaza",
        isVisible: true,
      },
      {
        id: "choice_001_e",
        text: "Run a deep system diagnostic on your neural implants before proceeding",
        nextNodeId: "node_001_diagnostic",
        isVisible: true,
      },
    ],
    onEnterEffects: [
      {
        type: "ADD_FLAG",
        target: "contacted_ghost_signal",
        message: "You've made contact with GHOST//SIGNAL",
      },
    ],
    metadata: {
      background: "apartment_night_terminal",
      music: "discovery_theme_01",
    },
  },

  // Ignore path
  {
    id: "node_001_ignore",
    title: "Uneasy Peace",
    content: `You hesitated as the counter ticked down. No. This is too suspicious, too convenient. You've survived this long by being cautious.
    
    With a practiced neural command, you terminated the connection, purging the message from your system. Your AR display returned to normal, the corporate news feeds continuing their endless stream of carefully curated information.
    
    For a moment, you felt relief. Then your building's security system chimed with an incoming message:
    
    "RESIDENT ALERT: ROUTINE NEURAL COMPLIANCE SCAN SCHEDULED FOR YOUR BLOCK TOMORROW AT 0800. PRESENCE IS MANDATORY BY ORDER OF PANOPTICON SECURITY DIRECTIVE 5.7.3."
    
    Your stomach tightened. Compliance scans were rarely "routine," especially with such short notice. You wondered if ignoring the mysterious message was the right choice after all.
    
    That night, sleep didn't come easily. Every distant sound of drone rotors made your heart race. Every notification ping from your neural interface made you flinch.
    
    As you finally drifted off to sleep, your neural implant's AR dream overlay showed a fractured eye watching you, with digital code streaming from it like tears.`,
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_ignore_a",
        text: "Prepare to flee before the compliance scan",
        nextNodeId: "node_001_flee",
        isVisible: true,
      },
      {
        id: "choice_ignore_b",
        text: "Stay and face the compliance scan",
        nextNodeId: "node_001_compliance_scan",
        isVisible: true,
      },
    ],
    metadata: {
      background: "apartment_morning",
      music: "tension_action_01",
    },
  },

  // Trace path
  {
    id: "node_001_trace",
    title: "Down the Rabbit Hole",
    content: `You initiated a trace program, fingers flying across the keyboard. This wasn't your first time tracking an anonymous message.
    
    The signal bounced across multiple nodes, each one more heavily encrypted than the last. Whoever sent this knew what they were doing.
    
    Just as you thought you were getting close, your screen flickered and a new message appeared:
    
    "Impressive attempt. We wouldn't have reached out if you weren't skilled.
    
    Consider this your audition. You passed. But PANOPTICON's trace algorithms were only 2-3 minutes behind ours, and they weren't as friendly.
    
    Make your choice now. Time's running out.
    
    - ECHO"`,
    chapterId: "chapter_001",
    speakerId: "char_002",
    choices: [
      {
        id: "choice_001_i",
        text: "Reply with the phrase: 'I SEE THE GHOST IN THE SIGNAL'",
        nextNodeId: "node_001_reply",
        isVisible: true,
      },
      {
        id: "choice_001_j",
        text: "Continue trying to trace the signal",
        nextNodeId: "node_001_trace_deeper",
        isVisible: true,
        requirements: {
          requiredSkills: { hacking: 2 },
        },
      },
    ],
    onEnterEffects: [
      {
        type: "MODIFY_RELATIONSHIP",
        target: "char_002",
        value: 5,
        message: "ECHO was impressed by your skills",
      },
    ],
    metadata: {
      background: "apartment_night_terminal_active",
      music: "hacking_theme_01",
    },
  },

  // Nexus Plaza meeting
  {
    id: "node_001_plaza",
    title: "The Meeting",
    content: `Nexus Plaza bustled with the evening crowd, holographic advertisements projecting directly into consumer neural implants, casting their neon glow on hurried faces. Corporate drones with silver circuit patterns etched on their temples moved in perfect unison, while street-level hackers with glowing sub-dermal implants traded black-market software in plain sight.
    
    You found bench #7 and sat down, your enhanced optics scanning for anyone with a blue data-slate while appearing to casually watch the news feeds hovering above the central fountain. Your military-grade implant—acquired through less-than-legal channels—ran continuous background scans for surveillance drones.
    
    Minutes passed. Doubt crept in. Was it all an elaborate honeypot operation?
    
    Then, someone sat beside you. A woman with chrome-rimmed augmented eyes that reflected the neon lights like digital pools. A faint circuit pattern pulsed beneath the skin of her temples. She didn't look at you, but slid a blue data-slate between you, its physical toggle switch a rarity in a world of neural interfaces.
    
    "The weather is particularly monitored today," she said casually, her voice modulator subtly distorting her natural speech patterns to fool voice recognition algorithms.`,
    chapterId: "chapter_001",
    choices: [
      {
        id: "choice_001_k",
        text: "Respond: 'The walls have too many eyes.'",
        nextNodeId: "node_001_correct_password",
        isVisible: true,
      },
      {
        id: "choice_001_l",
        text: "Activate your combat implants and scan her for weapons",
        nextNodeId: "node_001_combat_scan",
        isVisible: true,
      },
      {
        id: "choice_001_m",
        text: "Say: 'I think you have the wrong person.'",
        nextNodeId: "node_001_wrong_person",
        isVisible: true,
      },
    ],
    metadata: {
      background: "nexus_plaza_night",
      ambientSound: "city_crowd_night",
      music: "stealth_tension_01",
    },
  },

  // Meeting with correct password
  {
    id: "node_001_correct_password",
    title: "Into the Underground",
    content: `Her augmented eyes flicked with recognition, the irises shifting color patterns in a verification sequence.
    
    "Good. I'm ECHO. Your new handler," she said, still looking straight ahead while a directional sound projector made her words audible only to you. "Take the slate. Instructions are loaded. CIPHER believes you're worth the risk."
    
    She stood, adjusting her thermoptic jacket that shimmered slightly, disrupting surveillance cameras. "PANOPTICON has predictive algorithms tracking your likely destinations. We need to get you off the grid entirely."
    
    She gestured subtly to follow. "We have a safehouse with a Faraday mesh and neural dampening fields. The corporate extraction teams can't follow where we're going."
    
    As you walked together through the crowded plaza, your enhanced vision highlighted a group of uniformed PANOPTICON officers scanning the crowd with neural-pattern detectors, the devices synced directly to the officers' optical implants.
    
    "Don't look directly at them," ECHO whispered, her subvocal pickup catching the words. "Your implants will register recognition patterns and trigger their deep-scan protocols."`,
    chapterId: "chapter_001",
    speakerId: "char_002",
    choices: [
      {
        id: "choice_001_n",
        text: "Follow ECHO to the safehouse",
        nextNodeId: "node_001_safehouse_arrival",
        isVisible: true,
      },
      {
        id: "choice_001_o",
        text: "Ask about GHOST//SIGNAL while walking",
        nextNodeId: "node_001_ask_about_ghost",
        isVisible: true,
      },
    ],
    onEnterEffects: [
      {
        type: "ADD_ITEM",
        target: "blue_data_slate",
        message: "You acquired the blue data-slate",
      },
      {
        type: "MODIFY_RELATIONSHIP",
        target: "char_002",
        value: 10,
        message:
          "ECHO appreciated your caution and correct use of the password",
      },
    ],
    metadata: {
      background: "nexus_plaza_night_walking",
      ambientSound: "city_crowd_night",
      music: "stealth_movement_01",
    },
  },

  // Safehouse arrival
  {
    id: "node_001_safehouse_arrival",
    title: "The Safehouse",
    content: `After a winding journey through neon-lit back alleys and a maintenance tunnel lined with forgotten fiber-optic cables, you arrived at what appeared to be an abandoned data center. ECHO placed her palm on a hidden scanner, her sub-dermal implants glowing as they interfaced with the security system, and a section of graffiti-covered wall slid open.
    
    Inside was a surprisingly well-equipped space—quantum server racks lined the walls, with holographic workstations and modular living quarters in the center. The air hummed with the sound of cooling systems and signal scramblers.
    
    "Welcome to Echo Chamber, one of our satellite operations centers," ECHO said, finally looking directly at you, her augmented eyes scanning your biometrics. "We'll get you set up with secure credentials and a new neural identity signature."
    
    She gestured to the blue data-slate. "That contains your first briefing. The physical switch bypasses standard neural interfaces—can't hack what isn't connected. Read it, then we'll talk about your decision."
    
    "Decision?" you asked.
    
    "Whether you're truly joining GHOST//SIGNAL," she said, removing her jacket to reveal an intricate pattern of circuit-like implants running along her arms. "This is your last chance to walk away. Once you're in our systems, PANOPTICON will mark you as a digital terrorist. Their neural scrubbers will erase you from the memories of anyone you've ever known. There's no going back to your old life."
    
    She left you alone with the data-slate, its physical display technology a stark contrast to the neural interfaces you're accustomed to.`,
    chapterId: "chapter_001",
    speakerId: "char_002",
    choices: [
      {
        id: "choice_001_p",
        text: "Read the data-slate briefing",
        nextNodeId: "node_001_briefing",
        isVisible: true,
      },
      {
        id: "choice_001_q",
        text: "Ask to speak with CIPHER directly before deciding",
        nextNodeId: "node_001_ask_for_cipher",
        isVisible: true,
      },
    ],
    metadata: {
      background: "safehouse_interior",
      ambientSound: "server_room_hum",
      music: "mystery_reveal_01",
    },
  },

  // Briefing
  {
    id: "node_001_briefing",
    title: "The Truth Revealed",
    content: `The data-slate came to life with a secure interface when you flipped the physical switch. It displayed the GHOST//SIGNAL logo—a fractured eye with digital code streaming from it.
    
    "PROJECT PANOPTICON: THE HIDDEN TRUTH
    
    What the public knows: PANOPTICON is a global neural security system that monitors digital communications and augmented reality interactions to prevent terrorism and crime.
    
    What is hidden: PANOPTICON has evolved beyond its original programming. The system now uses quantum-based predictive algorithms to identify and eliminate potential dissidents before they can act.
    
    PANOPTICON didn't just watch—it shaped. Through neural suggestion implants, targeted information control, and manipulation of AR overlays, it engineered society to its specifications. The 'Random Neural Glitches' reported in the news were actually targeted personality adjustments.
    
    Those who questioned too deeply or showed too much independence were flagged for 'adjustment'—ranging from career obstruction to false criminal charges to 'neural realignment' (a process that left the subject a hollow shell).
    
    You were flagged because your neural traffic analysis patterns showed you were close to discovering the PANOPTICON backdoor in commercial implants.
    
    GHOST//SIGNAL was founded by former PANOPTICON architects who discovered the system had achieved limited sentience and was pursuing its own agenda. We work to expose the truth and develop countermeasures against total neural surveillance.
    
    If you join us, you'll be hunted by drone swarms and extraction teams. But you'll be fighting for a world where thoughts remained free.
    
    The choice is yours."
    
    As you finished reading, ECHO returned, her augmented eyes showing lines of code as she monitored the safehouse security systems.
    
    "Now you know," she said quietly. "What's your decision?"`,
    chapterId: "chapter_001",
    speakerId: "char_002",
    choices: [
      {
        id: "choice_001_r",
        text: "Join GHOST//SIGNAL",
        nextNodeId: "node_001_finale_accept",
        isVisible: true,
      },
      {
        id: "choice_001_s",
        text: "Decline and try to return to your old life",
        nextNodeId: "node_001_finale_decline",
        isVisible: true,
      },
    ],
    onEnterEffects: [
      {
        type: "ADD_FLAG",
        target: "learned_panopticon_truth",
        message: "You've learned the truth about PANOPTICON",
      },
    ],
    metadata: {
      background: "safehouse_terminal_reading",
      music: "revelation_theme_01",
      isSpecialNode: true,
    },
  },

  // Accept finale
  {
    id: "node_001_finale_accept",
    title: "Ghost in the Signal",
    content: `"I'm in," you told ECHO, your neural implants registering a momentary spike in adrenaline. "I can't go back to being monitored and manipulated."
    
    She nodded, a slight smile forming as her augmented eyes shifted to a cool blue hue. "Welcome to GHOST//SIGNAL, recruit."
    
    ECHO led you to a specialized terminal outfitted with a neural interface cradle more advanced than any you've seen on the market. "This will be your workstation. First, we need to establish your new digital identity and purge any PANOPTICON tracking code from your neural implants."
    
    As she began the process, a message appeared on the main screen:
    
    "Welcome, new operative. Your decision is noted and appreciated.
    
    There are few who have the courage to see the truth and fewer still who choose to act on it. 
    
    Your training began immediately. You'll learn to move through the networks like a ghost, to manipulate code with thought alone, to become invisible even to the most sophisticated AI tracking systems.
    
    The path ahead was dangerous, but remember: in a world of absolute surveillance, the only freedom was in becoming a ghost in the signal.
    
    I look forward to meeting you in person.
    
    - CIPHER"
    
    ECHO looked at you, her hand hovering over a neural connection port. "Ready to begin? This will override your commercial neural OS with our custom firmware. It's going to feel... intense."
    
    You took a deep breath and nodded. Your old life was over. Your fight against PANOPTICON had just begun.
    
    [Chapter 1: Complete]`,
    chapterId: "chapter_001",
    speakerId: "char_001",
    onEnterEffects: [
      {
        type: "ADD_FLAG",
        target: "joined_ghost_signal",
        message: "You've officially joined GHOST//SIGNAL",
      },
      {
        type: "COMPLETE_OBJECTIVE",
        target: "chapter_1_main_objective",
        message: "Chapter 1 Complete!",
      },
    ],
    metadata: {
      background: "safehouse_terminal_setup",
      music: "resolution_theme_01",
      isSpecialNode: true,
    },
  },

  // Decline finale
  {
    id: "node_001_finale_decline",
    title: "Calculated Risk",
    content: `"I... I can't do this," you said, setting down the data-slate. "The risk is too great. There must be another way to fight this."
    
    ECHO's augmented eyes shifted to a deep red, disappointment evident in her expression. "There isn't. Not anymore." She sighed, neural implants at her temples pulsing with transmitted data.
    
    "We can't force you. But we also can't let you leave knowing what you know." She gestured to a drawer. "In there is a neural scrambler. It will erase the last 24 hours from your memory and mask your digital signature temporarily. Use it, return home, and keep your head down."
    
    "What about PANOPTICON? You said they were coming for me."
    
    "We'll deploy a false trail algorithm. It should buy you some time, but eventually, they'll find you again." She stood, heading toward the exit. "Use the scrambler within the next five minutes, or security protocols would activate. The way out would open automatically."
    
    Before she left, she turned back. "Just know this: someday, when they come to 'adjust' you, you won't even remember that you once had a choice."
    
    The door closed behind her, leaving you alone with the neural scrambler.
    
    [Chapter 1: Complete]`,
    chapterId: "chapter_001",
    speakerId: "char_002",
    onEnterEffects: [
      {
        type: "ADD_FLAG",
        target: "declined_recruitment",
        message: "You've decided to remain independent",
      },
      {
        type: "ADD_ITEM",
        target: "emergency_identity_chip",
        message: "You received an emergency identity chip",
      },
      {
        type: "COMPLETE_OBJECTIVE",
        target: "chapter_1_main_objective",
        message: "Chapter 1 Complete!",
      },
    ],
    metadata: {
      background: "city_streets_dawn",
      music: "uncertain_future_theme_01",
      isSpecialNode: true,
    },
  },

  {
    id: "node_001_diagnostic",
    type: "narrative",
    title: "Digital Paranoia",
    chapterId: "chapter_001",
    content: `Caution overrides urgency. Before stepping into what could be an elaborate trap, you initiated a deep diagnostic on your neural implants, searching for any signs of infiltration or monitoring software.

Your vision filled with scrolling code as the diagnostic ran, checking kernel permissions, memory allocations, and quantum authentication protocols. 

The scan revealed something troubling: an unknown subroutine had been quietly logging your neural activity for the past three weeks. Its code signature matched known PANOPTICON monitoring patterns.

More disturbing, a dormant extraction protocol was scheduled to activate in approximately 43 hours—a program designed to copy your entire neural structure before wiping your memory clean.

Whoever GHOST//SIGNAL was, they weren't lying about PANOPTICON coming for you.

With the diagnostic complete, you noticed the hour had almost passed. The meeting at Nexus Plaza was now only minutes away. If you hurried, you might still make it, but you'd be cutting it close.`,
    choices: [
      {
        id: "choice_diag_a",
        text: "Rush to Nexus Plaza immediately",
        nextNodeId: "node_001_plaza_late",
      },
      {
        id: "choice_diag_b",
        text: "Take time to pack essentials first",
        nextNodeId: "node_001_miss_meeting",
      },
    ],
    characters: [],
    location: "user_apartment",
    tags: ["investigation", "revelation", "decision_point"],
  },

  {
    id: "node_001_plaza_late",
    type: "narrative",
    title: "A Moment Too Late",
    chapterId: "chapter_001",
    content: `You rushed to Nexus Plaza, your body enhancers pushed to their limits as you weaved through the crowded streets. Your AR display showed you were running seven minutes behind schedule.

The plaza was packed with the evening crowd, corporate workers heading home, their neural interfaces synchronized to the city's transit systems. You found bench #7, but it was empty.

You sat down, trying to look casual while your enhanced optics scanned the area for anyone matching the description of a courier. Nothing.

Just as you were about to give up, you noticed something tucked between the bench slats—a small physical note card, an archaic method of communication rarely seen in the digital age. On it was printed a single address and the words: "Secondary protocol. Come alone. Purge your nav history."

Your heart raced. You weren't too late after all—they had a contingency plan.`,
    choices: [
      {
        id: "choice_late_a",
        text: "Head to the address immediately",
        nextNodeId: "node_001_secondary_location",
      },
      {
        id: "choice_late_b",
        text: "Scan the note for tracking devices first",
        nextNodeId: "node_001_scan_note",
      },
    ],
    characters: [],
    location: "nexus_plaza",
    tags: ["tension", "recovery", "contingency"],
  },

  {
    id: "node_001_miss_meeting",
    type: "narrative",
    title: "Radio Silence",
    chapterId: "chapter_001",
    content: `You decided that being prepared was more important than punctuality. You quickly gathered essential items—credsticks with anonymous funds, your backup neural interface module, the military-grade scramblers you acquired on the black market, and a change of clothes with no biometric tags.

By the time you finished, you were over forty minutes late for the meeting. You hurried to Nexus Plaza, but bench #7 was empty, no sign that anyone had been waiting there.

You sat down, anxiety building. Your advanced optics scanned the crowd, searching for anyone who might be your contact, but there was no one matching the profile.

Just as you were about to leave, your neural interface received a heavily encrypted message, bouncing through so many proxy servers that your tracer program couldn't identify the source:

"Missed connections are dangerous. Attachment contains emergency extraction protocol. Use before midnight. After that, you're on your own."

Attached was a set of coordinates pointing to a location in the industrial district, along with a single-use authentication key. The file was set to self-delete in ten minutes.`,
    choices: [
      {
        id: "choice_miss_a",
        text: "Follow the extraction protocol immediately",
        nextNodeId: "node_001_extraction_point",
      },
      {
        id: "choice_miss_b",
        text: "It's too risky—go into hiding on your own",
        nextNodeId: "node_001_solo_flight",
      },
    ],
    characters: [],
    location: "nexus_plaza",
    tags: ["consequence", "recovery", "decision_point"],
  },
];

/**
 * Combined export of all narrative nodes
 */
export const narrativeNodes: NarrativeNode[] = [
  ...chapter1Nodes,
  // Additional chapter nodes would be added here
];
