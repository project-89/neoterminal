import { NarrativeNode } from "../../NarrativeNode";

/**
 * Chapter 3: The Data Heist
 *
 * The player's first major operation involves stealing valuable corporate data
 * while avoiding detection.
 */
export const chapter3Nodes: NarrativeNode[] = [
  // Chapter 3 Intro
  {
    id: "node_003_intro",
    type: "narrative",
    title: "The Big Score",
    content:
      'The holographic briefing room materializes around you as you connect to GHOST//SIGNAL\'s tactical server. This time, it\'s not just ECHO waiting for you—CIPHER stands at the head of the table, their hooded form more defined than you\'ve seen before.\n\n"Your training and first mission have exceeded expectations," CIPHER says, their modulated voice carrying a hint of genuine approval. "Now we need your skills for something more significant."\n\nA 3D model of a massive corporate arcology appears above the table—the headquarters of MegaTech Industries, one of PANOPTICON\'s primary hardware suppliers.\n\n"Inside their secure servers is evidence of illegal surveillance hardware being built into every neural interface they manufacture. We need that data."',
    chapterId: "chapter_003",
    choices: [
      {
        id: "choice_200_a",
        text: '"What kind of security are we looking at?"',
        targetNode: "node_201_security_briefing",
      },
      {
        id: "choice_200_b",
        text: '"Why me for this mission?"',
        targetNode: "node_202_mission_importance",
      },
      {
        id: "choice_200_c",
        text: '"What\'s the plan to get in?"',
        targetNode: "node_203_infiltration_plan",
      },
    ],
    characters: ["char_001", "char_002"],
    location: "tactical_briefing_room",
    tags: ["chapter_start", "mission_prep", "corporate"],
  },
];
