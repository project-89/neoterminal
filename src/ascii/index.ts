import { AsciiArtRenderer } from "./AsciiArtRenderer";

// Create a singleton instance of the ASCII art renderer
export const asciiArtRenderer = new AsciiArtRenderer();

// Re-export types and classes
export * from "./AsciiArtRenderer";

// Re-export art collections for direct access if needed
export * as cyberpunkArt from "./art/cyberpunk";
export * as missionArt from "./art/missions";
