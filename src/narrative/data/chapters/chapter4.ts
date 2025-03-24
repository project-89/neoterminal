import { NarrativeNode } from "../../NarrativeNode";

/**
 * Chapter 4: Digital Underground
 *
 * The player delves into the shadowy world of the blackmarket,
 * where illegal tech and information are traded.
 */
export const chapter4Nodes: NarrativeNode[] = [
  // Chapter 4 Intro
  {
    id: "node_004_intro",
    type: "narrative",
    title: "The Other Side",
    content:
      'After your successful data heist from MegaTech Industries, GHOST//SIGNAL has given you a rare commodity: downtime. But your rest is short-lived as ECHO contacts you with a new assignment.\n\n"The data you recovered needs to be authenticated and cross-referenced with other intelligence," she explains. "For that, we need to visit the Digital Underground."\n\nThe coordinates she sends lead to a part of the network you\'ve never seen before—a chaotic, neon-drenched virtual realm where digital contraband flows freely between anonymous avatars.\n\n"Welcome to Freeside," ECHO says as your consciousness resolves in this new space. "The last truly free data market in Neo-Shanghai. Trust no one here except me."',
    chapterId: "chapter_004",
    choices: [
      {
        id: "choice_300_a",
        text: '"Who are we meeting here?"',
        targetNode: "node_301_broker_intro",
      },
      {
        id: "choice_300_b",
        text: '"Is it safe to be here? This place seems exposed."',
        targetNode: "node_302_security_discussion",
      },
      {
        id: "choice_300_c",
        text: '"Let\'s get this over with. Where do we go?"',
        targetNode: "node_303_market_navigation",
      },
    ],
    characters: ["char_002"],
    location: "freeside_market",
    tags: ["chapter_start", "underground", "digital_market"],
  },
];
