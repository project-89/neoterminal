import { CharacterManager } from "./characters/CharacterManager";
import { ChapterManager } from "./chapters/ChapterManager";
import { NodeManager } from "./nodes/NodeManager";
import { NarrativeNode, NarrativeChoice } from "./nodes/NarrativeNode";
import { Character } from "./characters/Character";
import { NarrativeChapter } from "./chapters/NarrativeChapter";

import { characters } from "./data/characters";
import { narrativeNodes } from "./data/nodes";

/**
 * Main narrative system manager that orchestrates characters, chapters, and nodes
 */
export class NarrativeManager {
  /** Character manager instance */
  private characterManager: CharacterManager;

  /** Chapter manager instance */
  private chapterManager: ChapterManager;

  /** Node manager instance */
  private nodeManager: NodeManager;

  /** Event listeners for narrative events */
  private eventListeners: Map<string, Function[]>;

  /**
   * Creates a new NarrativeManager
   */
  constructor() {
    // Initialize managers
    this.characterManager = new CharacterManager();
    this.chapterManager = new ChapterManager();
    this.nodeManager = new NodeManager(
      this.characterManager,
      this.chapterManager
    );

    // Initialize event listeners
    this.eventListeners = new Map<string, Function[]>();

    // Load initial data
    this.initializeData();
  }

  /**
   * Loads initial narrative data
   */
  private initializeData(): void {
    // Characters are loaded automatically by CharacterManager constructor

    // Chapters are loaded automatically by ChapterManager constructor

    // Load nodes from data file
    this.nodeManager.loadNodes(narrativeNodes);
  }

  /**
   * Starts a specific chapter
   * @param chapterId - ID of chapter to start
   * @returns True if chapter was successfully started
   */
  public startChapter(chapterId: string): boolean {
    const chapter = this.chapterManager.getChapter(chapterId);
    if (!chapter) {
      this.triggerEvent("error", `Chapter ${chapterId} not found`);
      return false;
    }

    // Set as active chapter
    if (!this.chapterManager.setActiveChapter(chapterId)) {
      this.triggerEvent(
        "error",
        `Failed to set chapter ${chapterId} as active`
      );
      return false;
    }

    // Navigate to starting node
    if (!this.nodeManager.setCurrentNode(chapter.startingNodeId)) {
      this.triggerEvent(
        "error",
        `Failed to navigate to starting node ${chapter.startingNodeId}`
      );
      return false;
    }

    this.triggerEvent("chapterStarted", { chapterId });
    return true;
  }

  /**
   * Gets the currently active node
   * @returns The current narrative node or null if none active
   */
  public getCurrentNode(): NarrativeNode | null {
    return this.nodeManager.getCurrentNode();
  }

  /**
   * Makes a choice in the current node
   * @param choiceId - ID of choice to select
   * @returns True if choice was successfully selected
   */
  public makeChoice(choiceId: string): boolean {
    const result = this.nodeManager.selectChoice(choiceId);

    if (result) {
      const currentNode = this.nodeManager.getCurrentNode();

      // Check if this is a chapter ending node
      if (currentNode) {
        const activeChapter = this.chapterManager.getActiveChapter();

        if (
          activeChapter &&
          activeChapter.endingNodeIds.includes(currentNode.id)
        ) {
          // This is an ending node, complete the chapter
          this.chapterManager.completeChapter(activeChapter.id);
          this.triggerEvent("chapterCompleted", {
            chapterId: activeChapter.id,
            endingNodeId: currentNode.id,
          });
        }
      }

      this.triggerEvent("choiceMade", { choiceId });
    }

    return result;
  }

  /**
   * Gets available choices for the current node
   * @returns Array of available choices
   */
  public getAvailableChoices(): NarrativeChoice[] {
    return this.nodeManager.getAvailableChoices();
  }

  /**
   * Gets the current speaker (character) if any
   * @returns The speaking character or null
   */
  public getCurrentSpeaker(): Character | null {
    const speakerId = this.nodeManager.getCurrentNode()?.speakerId;
    if (!speakerId) return null;

    return this.characterManager.getCharacter(speakerId);
  }

  /**
   * Gets all available chapters
   * @returns Array of available chapters
   */
  public getAvailableChapters(): NarrativeChapter[] {
    return this.chapterManager.getAvailableChapters();
  }

  /**
   * Gets all chapters in order
   * @returns Array of chapters sorted by order
   */
  public getAllChapters(): NarrativeChapter[] {
    return this.chapterManager.getOrderedChapters();
  }

  /**
   * Gets a character by ID
   * @param characterId - ID of character to retrieve
   * @returns The character or null if not found
   */
  public getCharacter(characterId: string): Character | null {
    return this.characterManager.getCharacter(characterId);
  }

  /**
   * Adds a game flag
   * @param flag - Flag to add
   */
  public addFlag(flag: string): void {
    this.chapterManager.addFlag(flag);
    this.nodeManager.updateGameState({
      flags: new Set([...this.nodeManager.getGameState().flags, flag]),
    });
    this.triggerEvent("flagAdded", { flag });
  }

  /**
   * Removes a game flag
   * @param flag - Flag to remove
   */
  public removeFlag(flag: string): void {
    this.chapterManager.removeFlag(flag);
    const currentFlags = this.nodeManager.getGameState().flags;
    currentFlags.delete(flag);
    this.nodeManager.updateGameState({ flags: currentFlags });
    this.triggerEvent("flagRemoved", { flag });
  }

  /**
   * Checks if a flag is set
   * @param flag - Flag to check
   * @returns True if flag is set
   */
  public hasFlag(flag: string): boolean {
    return this.chapterManager.hasFlag(flag);
  }

  /**
   * Updates player level
   * @param level - New player level
   */
  public setPlayerLevel(level: number): void {
    this.chapterManager.setPlayerLevel(level);
    this.nodeManager.updateGameState({ playerLevel: level });
    this.triggerEvent("playerLevelChanged", { level });
  }

  /**
   * Gets a chapter by ID
   * @param chapterId - ID of chapter to retrieve
   * @returns The chapter or undefined if not found
   */
  public getChapter(chapterId: string): NarrativeChapter | undefined {
    return this.chapterManager.getChapter(chapterId);
  }

  /**
   * Gets all completed chapters
   * @returns Array of completed chapter IDs
   */
  public getCompletedChapters(): string[] {
    return this.chapterManager.getCompletedChapters();
  }

  /**
   * Checks if a chapter is completed
   * @param chapterId - ID of chapter to check
   * @returns True if chapter is completed
   */
  public isChapterCompleted(chapterId: string): boolean {
    return this.chapterManager.isChapterCompleted(chapterId);
  }

  /**
   * Updates character relationship with player
   * @param characterId - ID of character to update
   * @param value - Relationship value change (positive or negative)
   * @returns New relationship value
   */
  public updateCharacterRelationship(
    characterId: string,
    value: number
  ): number {
    const character = this.characterManager.getCharacter(characterId);
    if (!character) {
      return 0;
    }

    // Get current value
    const currentValue = character.relationshipWithPlayer || 0;
    let newValue = currentValue + value;

    // Ensure value stays within bounds (-100 to 100)
    newValue = Math.max(-100, Math.min(100, newValue));

    // Update character
    this.characterManager.updateCharacter(characterId, {
      relationshipWithPlayer: newValue,
    });

    this.triggerEvent("relationshipChanged", {
      characterId,
      previousValue: currentValue,
      newValue,
    });

    return newValue;
  }

  /**
   * Gets a character's relationship with the player
   * @param characterId - ID of the character
   * @returns Relationship value or 0 if character not found
   */
  public getCharacterRelationship(characterId: string): number {
    return this.characterManager.getCharacterRelationship(characterId);
  }

  /**
   * Adds an event listener
   * @param event - Event type to listen for
   * @param callback - Function to call when event occurs
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Removes an event listener
   * @param event - Event type
   * @param callback - Function to remove
   */
  public removeEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      return;
    }

    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(callback);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Triggers an event
   * @param event - Event type to trigger
   * @param data - Data to pass to event listeners
   */
  private triggerEvent(event: string, data: any): void {
    if (!this.eventListeners.has(event)) {
      return;
    }

    for (const callback of this.eventListeners.get(event)!) {
      callback(data);
    }
  }

  /**
   * Saves the current narrative state
   * @returns Serialized narrative state
   */
  public saveState(): any {
    return {
      activeChapter: this.chapterManager.getActiveChapter()?.id || null,
      completedChapters: this.chapterManager.getCompletedChapters(),
      currentNode: this.nodeManager.getCurrentNode()?.id || null,
      nodeHistory: this.nodeManager.getNodeHistory(),
      playerLevel: this.chapterManager.getPlayerLevel(),
      flags: this.chapterManager.getAllFlags(),
      gameState: this.nodeManager.getGameState(),
      characterRelationships: this.getAllCharacterRelationships(),
    };
  }

  /**
   * Gets all character relationships
   * @returns Record of character IDs to relationship values
   */
  private getAllCharacterRelationships(): Record<string, number> {
    const relationships: Record<string, number> = {};

    for (const character of this.characterManager.getAllCharacters()) {
      relationships[character.id] = character.relationshipWithPlayer || 0;
    }

    return relationships;
  }

  /**
   * Loads a previously saved narrative state
   * @param state - Saved state to load
   */
  public loadState(state: any): void {
    // Reset everything first
    this.resetState();

    // Load flags
    if (state.flags) {
      for (const flag of state.flags) {
        this.chapterManager.addFlag(flag);
      }
    }

    // Load player level
    if (state.playerLevel) {
      this.chapterManager.setPlayerLevel(state.playerLevel);
    }

    // Load character relationships
    if (state.characterRelationships) {
      for (const [characterId, relationship] of Object.entries(
        state.characterRelationships
      )) {
        this.characterManager.updateCharacter(characterId, {
          relationshipWithPlayer: relationship as number,
        });
      }
    }

    // Load game state
    if (state.gameState) {
      this.nodeManager.updateGameState(state.gameState);
    }

    // Load completed chapters
    if (state.completedChapters) {
      for (const chapterId of state.completedChapters) {
        this.chapterManager.completeChapter(chapterId);
      }
    }

    // Load active chapter
    if (state.activeChapter) {
      this.chapterManager.setActiveChapter(state.activeChapter);
    }

    // Load current node
    if (state.currentNode) {
      this.nodeManager.setCurrentNode(state.currentNode);
    }

    this.triggerEvent("stateLoaded", { success: true });
  }

  /**
   * Resets the entire narrative state
   */
  public resetState(): void {
    this.chapterManager.resetProgress();
    this.nodeManager.resetGameState();

    this.triggerEvent("stateReset", { success: true });
  }
}
