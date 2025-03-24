import { NarrativeNode, NodeEffect } from "../NarrativeNode";
import { NarrativeChoice } from "../NarrativeChoice";
import { NarrativeChapter } from "../chapters/NarrativeChapter";

/**
 * Utility functions to adapt between different versions of the narrative interfaces
 */

/**
 * Adapts any NarrativeNode to ensure it has all required properties
 */
export function adaptNarrativeNode(node: any): NarrativeNode {
  if (!node) return null as any;

  // Ensure type property exists
  const adaptedNode: NarrativeNode = {
    ...node,
    type: node.type || "narrative",
  };

  // Adapt choices if they exist
  if (node.choices && Array.isArray(node.choices)) {
    adaptedNode.choices = node.choices.map(adaptNarrativeChoice);
  }

  return adaptedNode;
}

/**
 * Adapts any NarrativeChoice to ensure it has all required properties
 */
export function adaptNarrativeChoice(choice: any): NarrativeChoice {
  if (!choice) return null as any;

  // Handle both nextNodeId and targetNode
  const targetNode = choice.targetNode || choice.nextNodeId || "";

  const adaptedChoice: NarrativeChoice = {
    ...choice,
    targetNode,
    // If isVisible isn't specified, default to true
    isVisible: choice.isVisible === undefined ? true : choice.isVisible,
  };

  return adaptedChoice;
}

/**
 * Safely get a string value that might be undefined
 */
export function safeString(value: string | undefined): string {
  return value || "";
}

/**
 * Safely get a number value that might be undefined
 */
export function safeNumber(value: number | undefined): number {
  return value !== undefined ? value : 0;
}

/**
 * Adapt a NodeEffect to ensure it has all required properties
 */
export function adaptNodeEffect(effect: any): NodeEffect {
  if (!effect) return null as any;

  return {
    ...effect,
    type: effect.type || "custom",
    // Convert uppercase effect types to lowercase for compatibility
    ...(effect.type &&
      effect.type.includes("_") && {
        type: effect.type
          .toLowerCase()
          .replace(/_flag$/, "_flag")
          .replace(/_item$/, "_item"),
      }),
  };
}

/**
 * Resolve the type of NarrativeChapter from undefined to null
 */
export function resolveChapter(chapter: any): any | null {
  return chapter || null;
}

/**
 * Safely handle a string value that TypeScript thinks might be undefined
 * but we know isn't (or are checking before calling)
 */
export function assertString(value: string | undefined): string {
  if (value === undefined) {
    return "";
  }
  return value;
}

/**
 * Type guard to check if value is a non-empty string
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === "string" && value !== "";
}

/**
 * Safely cast chapter to expected type
 */
export function castChapter(chapter: any): any | null {
  if (!chapter) return null;
  return chapter as NarrativeChapter;
}

/**
 * Strong type assertion functions for type safety
 */

/**
 * Ensures a string value is defined, substituting an empty string for undefined
 * This function includes a TypeScript type assertion
 */
export function ensureString(value: string | undefined | null): string {
  return value === undefined || value === null ? "" : value;
}

/**
 * Ensures a number value is defined, substituting zero for undefined
 * This function includes a TypeScript type assertion
 */
export function ensureNumber(value: number | undefined | null): number {
  return value === undefined || value === null ? 0 : value;
}

/**
 * Creates a type-safe version of NarrativeNode adaptations
 * @param node The node to adapt
 * @returns A strongly typed version
 */
export function createTypeSafeNode<T>(node: any): T {
  if (!node) return {} as T;
  return node as T;
}

/**
 * Force-casts a possibly undefined chapter to a non-null chapter
 * Use this only when you know the chapter exists
 * @param chapter The chapter to cast
 * @returns A non-null chapter
 */
export function forceNonNullChapter(
  chapter: NarrativeChapter | undefined | null
): NarrativeChapter {
  if (!chapter) {
    // Create a minimal valid chapter structure to avoid null errors
    return {
      id: "null-chapter",
      title: "Unknown Chapter",
      description: "This chapter does not exist",
      order: -1,
      startingNodeId: "",
      endingNodeIds: [],
    };
  }
  return chapter;
}
