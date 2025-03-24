import { NarrativeNode } from "../../NarrativeNode";

/**
 * Chapter 5: Corporate Infiltration
 *
 * The player takes on their most dangerous mission yet - physically
 * infiltrating a corporate facility.
 */
export const chapter5Nodes: NarrativeNode[] = [
  // Chapter 5 Intro
  {
    id: "node_005_intro",
    type: "narrative",
    title: "Crossing Thresholds",
    content:
      'The GHOST//SIGNAL sanctuary is unusually crowded today. Multiple operatives move with purpose, checking equipment and exchanging data packets. Something big is happening.\n\nCIPHER and ECHO stand by a holographic model of what appears to be a massive physical structure—PANOPTICON\'s Central Processing Hub, the heart of their global surveillance network.\n\n"The evidence you gathered from the underground has given us everything we need," CIPHER says, turning to face you. "We now have proof of illegal mass surveillance, corporate corruption, and human rights violations on an unprecedented scale."\n\nECHO\'s expression is serious as she continues, "But digital evidence isn\'t enough. We need to physically access their central core to upload our disclosure package. Someone needs to go in person."\n\nCIPHER\'s hooded figure turns to you. "We believe you\'re ready for this mission. Unlike our purely digital operatives, your natural affinity for the Chronos Protocol works in both realms—code and physical reality."',
    chapterId: "chapter_005",
    choices: [
      {
        id: "choice_400_a",
        text: '"You want me to physically break into PANOPTICON headquarters?"',
        targetNode: "node_401_mission_clarification",
      },
      {
        id: "choice_400_b",
        text: '"What\'s the plan for getting in?"',
        targetNode: "node_402_infiltration_strategy",
      },
      {
        id: "choice_400_c",
        text: '"This sounds like a suicide mission."',
        targetNode: "node_403_risk_assessment",
      },
    ],
    characters: ["char_001", "char_002"],
    location: "ghost_signal_command",
    tags: ["chapter_start", "high_stakes", "physical_world"],
  },
];
