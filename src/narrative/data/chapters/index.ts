import { chapter1Nodes } from "./chapter1";
import { chapter2Nodes } from "./chapter2";
import { chapter3Nodes } from "./chapter3";
import { chapter4Nodes } from "./chapter4";
import { chapter5Nodes } from "./chapter5";

/**
 * All narrative nodes grouped by chapter
 */
export {
  chapter1Nodes,
  chapter2Nodes,
  chapter3Nodes,
  chapter4Nodes,
  chapter5Nodes,
};

/**
 * Complete collection of all narrative nodes across all chapters
 */
export const narrativeNodes = [
  ...chapter1Nodes,
  ...chapter2Nodes,
  ...chapter3Nodes,
  ...chapter4Nodes,
  ...chapter5Nodes,
];
