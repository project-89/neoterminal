import { Character } from "../characters/Character";

/**
 * Initial characters for the narrative
 */
export const characters: Character[] = [
  // GHOST//SIGNAL Members
  {
    id: "char_001",
    name: "CIPHER",
    description:
      "The enigmatic founder and leader of GHOST//SIGNAL. Their identity remains unknown even to most members.",
    faction: "GHOST//SIGNAL",
    role: "Leader",
    avatar: "assets/avatars/cipher.png",
    personality: ["mysterious", "brilliant", "calculating", "visionary"],
    relationshipWithPlayer: 0, // Neutral to start
    dialogueStyle:
      "Cryptic, speaks in technical metaphors, rarely gives direct answers",
    backstory:
      "Once a high-ranking PANOPTICON engineer who discovered the truth about the system they helped build and defected.",
    motivations:
      "To expose PANOPTICON's illegal surveillance, dismantle corporate control over society, restore digital privacy.",
    metadata: {
      voiceProfile: "deep, electronically distorted",
      firstAppearance: "chapter_001",
      secretIdentity: "classified",
    },
  },

  {
    id: "char_002",
    name: "ECHO",
    description:
      "Your primary handler and mentor within GHOST//SIGNAL. Expert in communications and information retrieval.",
    faction: "GHOST//SIGNAL",
    role: "Handler",
    avatar: "assets/avatars/echo.png",
    personality: ["patient", "detail-oriented", "protective", "pragmatic"],
    relationshipWithPlayer: 10, // Slightly positive
    dialogueStyle:
      "Direct and clear, professional but friendly, uses technical jargon with explanations",
    backstory:
      "Former intelligence analyst who became disillusioned with government surveillance programs.",
    motivations:
      "To mentor new recruits, protect GHOST//SIGNAL operatives, expose corporate corruption",
    knownLocations: ["safe_house_alpha", "comm_hub_east"],
    metadata: {
      voiceProfile: "calm, measured",
      firstAppearance: "chapter_001",
    },
  },

  {
    id: "char_003",
    name: "SPECTER",
    description:
      "Elite hacker specializing in system infiltration and data extraction. Known for leaving no digital trace.",
    faction: "GHOST//SIGNAL",
    role: "Infiltration Specialist",
    avatar: "assets/avatars/specter.png",
    personality: ["reckless", "brilliant", "sarcastic", "competitive"],
    relationshipWithPlayer: 0, // Neutral to start
    dialogueStyle:
      "Rapid-fire tech jargon, challenging, frequently uses hacker slang",
    backstory:
      "Self-taught programmer who gained notoriety for hacking major corporations before joining GHOST//SIGNAL.",
    motivations:
      "Seeking the ultimate challenge, proving technical superiority, personal vendetta against MegaCorp",
    inventory: [
      "custom_deck_prototype",
      "infiltration_software_v3",
      "ghost_protocol_module",
    ],
    metadata: {
      voiceProfile: "fast-paced, energetic",
      firstAppearance: "chapter_002",
    },
  },

  // Corporate Characters
  {
    id: "char_004",
    name: "DIRECTOR SHAW",
    description:
      "High-ranking executive at PANOPTICON Corporation, oversees surveillance operations.",
    faction: "PANOPTICON",
    role: "Executive",
    avatar: "assets/avatars/shaw.png",
    personality: ["cold", "methodical", "ambitious", "ruthless"],
    relationshipWithPlayer: -50, // Antagonistic
    dialogueStyle: "Formal, condescending, speaks in corporate euphemisms",
    backstory:
      "Rose through corporate ranks by eliminating competition, both figuratively and literally.",
    motivations:
      "Expand PANOPTICON's control, eliminate resistance, gain more power within corporate hierarchy",
    knownLocations: ["panopticon_hq", "executive_tower"],
    metadata: {
      voiceProfile: "precise, clinical",
      securityClearance: "omega-level",
      firstAppearance: "chapter_003",
    },
  },

  {
    id: "char_005",
    name: "RAVEN",
    description:
      "Elite corporate security specialist hunting GHOST//SIGNAL members.",
    faction: "PANOPTICON",
    role: "Security Operative",
    avatar: "assets/avatars/raven.png",
    personality: ["persistent", "clever", "honorable", "dedicated"],
    relationshipWithPlayer: -30, // Negative but professional
    dialogueStyle:
      "Direct, minimal, occasionally respectful of worthy opponents",
    backstory:
      "Former special forces soldier recruited to PANOPTICON's security division, true believer in order through surveillance.",
    motivations:
      "Maintain social order, eliminate 'terrorist' threats, uphold the system",
    inventory: ["tactical_scanner", "neural_tracker", "combat_augmentations"],
    metadata: {
      voiceProfile: "steady, authoritative",
      dangerLevel: "extreme",
      firstAppearance: "chapter_003",
    },
  },

  // Independent/Neutral Characters
  {
    id: "char_006",
    name: "VORTEX",
    description:
      "Information broker and black market dealer specializing in rare tech and data.",
    faction: "Independent",
    role: "Black Market Dealer",
    avatar: "assets/avatars/vortex.png",
    personality: [
      "charismatic",
      "opportunistic",
      "untrustworthy",
      "well-informed",
    ],
    relationshipWithPlayer: 0, // Neutral, business-oriented
    dialogueStyle: "Colorful slang, sales pitches, always negotiating",
    backstory:
      "Former corporate data analyst who saw more profit in selling information than analyzing it.",
    motivations:
      "Profit, survival, maintaining neutrality between factions, expanding information network",
    knownLocations: [
      "black_market_hub",
      "neutral_zone_safehouse",
      "data_haven_club",
    ],
    inventory: [
      "encryption_keys",
      "blackmarket_access_cards",
      "rare_data_fragments",
    ],
    metadata: {
      voiceProfile: "smooth, persuasive",
      reliability: "questionable",
      firstAppearance: "chapter_004",
    },
  },
];
