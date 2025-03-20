import { NarrativeChapter } from "../chapters/NarrativeChapter";

/**
 * Initial chapters for the narrative
 */
export const chapters: NarrativeChapter[] = [
  // Chapter 1: The Awakening
  {
    id: "chapter_001",
    title: "The Awakening",
    description:
      "Your journey begins as you discover the truth about PANOPTICON's surveillance system and join the GHOST//SIGNAL collective.",
    order: 1,
    startingNodeId: "node_001_intro",
    endingNodeIds: ["node_001_finale_accept", "node_001_finale_decline"],
    unlockRequirements: {
      completedChapters: [],
      playerLevel: 1,
      flags: [],
    },
    metadata: {
      author: "GHOST//SIGNAL",
      estimatedDuration: 30,
      difficulty: 1,
      tags: ["intro", "tutorial", "recruitment"],
    },
  },

  // Chapter 2: Digital Footprints
  {
    id: "chapter_002",
    title: "Digital Footprints",
    description:
      "You undertake your first real mission for GHOST//SIGNAL, learning to cover your tracks in the digital world.",
    order: 2,
    startingNodeId: "node_002_intro",
    endingNodeIds: [
      "node_002_finale_success",
      "node_002_finale_partial",
      "node_002_finale_failure",
    ],
    unlockRequirements: {
      completedChapters: ["chapter_001"],
      playerLevel: 2,
      flags: ["joined_ghost_signal"],
    },
    metadata: {
      author: "GHOST//SIGNAL",
      estimatedDuration: 45,
      difficulty: 2,
      tags: ["hacking", "stealth", "security"],
    },
  },

  // Chapter 3: The Data Heist
  {
    id: "chapter_003",
    title: "The Data Heist",
    description:
      "Your first major operation involves stealing valuable corporate data while avoiding detection.",
    order: 3,
    startingNodeId: "node_003_intro",
    endingNodeIds: [
      "node_003_finale_success",
      "node_003_finale_detected",
      "node_003_finale_failure",
    ],
    unlockRequirements: {
      completedChapters: ["chapter_002"],
      playerLevel: 3,
      flags: ["completed_basic_training"],
    },
    metadata: {
      author: "GHOST//SIGNAL",
      estimatedDuration: 60,
      difficulty: 3,
      tags: ["infiltration", "corporate", "data_retrieval"],
    },
  },

  // Chapter 4: Digital Underground
  {
    id: "chapter_004",
    title: "Digital Underground",
    description:
      "Delve into the shadowy world of the blackmarket, where illegal tech and information are traded.",
    order: 4,
    startingNodeId: "node_004_intro",
    endingNodeIds: [
      "node_004_finale_trusted",
      "node_004_finale_neutral",
      "node_004_finale_suspected",
    ],
    unlockRequirements: {
      completedChapters: ["chapter_003"],
      playerLevel: 4,
      flags: ["first_heist_completed"],
    },
    metadata: {
      author: "GHOST//SIGNAL",
      estimatedDuration: 75,
      difficulty: 3,
      tags: ["blackmarket", "netrunners", "upgrades"],
    },
  },

  // Chapter 5: Corporate Infiltration
  {
    id: "chapter_005",
    title: "Corporate Infiltration",
    description:
      "You take on your most dangerous mission yet - physically infiltrating a corporate facility.",
    order: 5,
    startingNodeId: "node_005_intro",
    endingNodeIds: [
      "node_005_finale_success",
      "node_005_finale_escape",
      "node_005_finale_captured",
    ],
    unlockRequirements: {
      completedChapters: ["chapter_004"],
      playerLevel: 5,
      flags: ["underground_network_access"],
    },
    metadata: {
      author: "GHOST//SIGNAL",
      estimatedDuration: 90,
      difficulty: 4,
      tags: ["physical_infiltration", "corporate", "high_risk"],
    },
  },
];
