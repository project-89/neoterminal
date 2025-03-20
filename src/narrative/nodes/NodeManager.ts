import { NarrativeNode, NarrativeChoice, NodeEffect } from "./NarrativeNode";
import { CharacterManager } from "../characters/CharacterManager";
import { ChapterManager } from "../chapters/ChapterManager";

/**
 * Game state context for evaluating node requirements and effects
 */
interface GameStateContext {
  playerLevel: number;
  inventory: string[];
  skills: Record<string, number>;
  flags: Set<string>;
  relationships: Record<string, number>;
  stats: Record<string, number>;
}

/**
 * Manages narrative nodes, choices, and transitions
 */
export class NodeManager {
  /** Map of nodes by ID */
  private nodes: Map<string, NarrativeNode>;

  /** Currently active node */
  private currentNode: NarrativeNode | null;

  /** Reference to character manager */
  private characterManager: CharacterManager;

  /** Reference to chapter manager */
  private chapterManager: ChapterManager;

  /** Game state context */
  private gameState: GameStateContext;

  /** Node history stack */
  private nodeHistory: string[];

  /**
   * Creates a new NodeManager
   * @param characterManager - Character manager instance
   * @param chapterManager - Chapter manager instance
   */
  constructor(
    characterManager: CharacterManager,
    chapterManager: ChapterManager
  ) {
    this.nodes = new Map<string, NarrativeNode>();
    this.currentNode = null;
    this.characterManager = characterManager;
    this.chapterManager = chapterManager;
    this.nodeHistory = [];
    this.gameState = {
      playerLevel: 1,
      inventory: [],
      skills: {},
      flags: new Set<string>(),
      relationships: {},
      stats: {},
    };
  }

  /**
   * Loads nodes into the manager
   * @param nodesToLoad - Array of nodes to load
   */
  public loadNodes(nodesToLoad: NarrativeNode[]): void {
    nodesToLoad.forEach((node) => {
      this.nodes.set(node.id, node);
    });
  }

  /**
   * Adds a single node to the manager
   * @param node - Node to add
   */
  public addNode(node: NarrativeNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Gets a node by ID
   * @param nodeId - ID of node to retrieve
   * @returns The node or undefined if not found
   */
  public getNode(nodeId: string): NarrativeNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Gets all nodes for a specific chapter
   * @param chapterId - ID of chapter to get nodes for
   * @returns Array of nodes for the chapter
   */
  public getNodesForChapter(chapterId: string): NarrativeNode[] {
    return Array.from(this.nodes.values()).filter(
      (node) => node.chapterId === chapterId
    );
  }

  /**
   * Sets the current active node
   * @param nodeId - ID of node to set as active
   * @returns True if node was found and set as active
   */
  public setCurrentNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    // Store current node in history if we have one
    if (this.currentNode) {
      this.nodeHistory.push(this.currentNode.id);

      // Execute any exit effects of the current node
      if (this.currentNode.onExitEffects) {
        this.processNodeEffects(this.currentNode.onExitEffects);
      }
    }

    // Set new current node
    this.currentNode = node;

    // Execute any entry effects of the new node
    if (node.onEnterEffects) {
      this.processNodeEffects(node.onEnterEffects);
    }

    return true;
  }

  /**
   * Gets the current active node
   * @returns The current node or null if none is active
   */
  public getCurrentNode(): NarrativeNode | null {
    return this.currentNode;
  }

  /**
   * Gets the speaker for the current node
   * @returns The character speaking in the current node, or undefined if none
   */
  public getCurrentSpeaker() {
    if (!this.currentNode || !this.currentNode.speakerId) {
      return undefined;
    }

    return this.characterManager.getCharacter(this.currentNode.speakerId);
  }

  /**
   * Returns to the previous node in history
   * @returns True if successfully returned to previous node
   */
  public goBack(): boolean {
    if (this.nodeHistory.length === 0) {
      return false;
    }

    const previousNodeId = this.nodeHistory.pop()!;
    if (!this.nodes.has(previousNodeId)) {
      return false;
    }

    // Set the node without adding to history
    const node = this.nodes.get(previousNodeId)!;

    // Process exit effects
    if (this.currentNode?.onExitEffects) {
      this.processNodeEffects(this.currentNode.onExitEffects);
    }

    this.currentNode = node;

    // Process entry effects
    if (node.onEnterEffects) {
      this.processNodeEffects(node.onEnterEffects);
    }

    return true;
  }

  /**
   * Selects a choice from the current node
   * @param choiceId - ID of the choice to select
   * @returns True if choice was valid and selection succeeded
   */
  public selectChoice(choiceId: string): boolean {
    if (!this.currentNode || !this.currentNode.choices) {
      return false;
    }

    const choice = this.currentNode.choices.find((c) => c.id === choiceId);
    if (!choice) {
      return false;
    }

    // Check if choice is visible
    if (!choice.isVisible) {
      return false;
    }

    // Check requirements
    if (choice.requirements && !this.meetsRequirements(choice.requirements)) {
      return false;
    }

    // Process choice effects
    if (choice.effects) {
      this.processNodeEffects(choice.effects);
    }

    // Navigate to the next node
    return this.setCurrentNode(choice.nextNodeId);
  }

  /**
   * Gets the available choices for the current node
   * @param includeInvisible - Whether to include invisible choices
   * @returns Array of available choices
   */
  public getAvailableChoices(
    includeInvisible: boolean = false
  ): NarrativeChoice[] {
    if (!this.currentNode || !this.currentNode.choices) {
      return [];
    }

    return this.currentNode.choices.filter((choice) => {
      // If we're not including invisible choices and this one is invisible, filter it out
      if (!includeInvisible && !choice.isVisible) {
        return false;
      }

      // Check requirements if present
      if (choice.requirements) {
        return this.meetsRequirements(choice.requirements);
      }

      return true;
    });
  }

  /**
   * Checks if the current game state meets the specified requirements
   * @param requirements - Requirements to check
   * @returns True if all requirements are met
   */
  private meetsRequirements(requirements: any): boolean {
    // Check player level
    if (
      requirements.playerLevel &&
      this.gameState.playerLevel < requirements.playerLevel
    ) {
      return false;
    }

    // Check required items
    if (requirements.requiredItems && requirements.requiredItems.length > 0) {
      for (const item of requirements.requiredItems) {
        if (!this.gameState.inventory.includes(item)) {
          return false;
        }
      }
    }

    // Check required skills
    if (requirements.requiredSkills) {
      for (const [skill, level] of Object.entries(
        requirements.requiredSkills
      )) {
        if (
          !this.gameState.skills[skill] ||
          this.gameState.skills[skill] < (level as number)
        ) {
          return false;
        }
      }
    }

    // Check required flags
    if (requirements.flags && requirements.flags.length > 0) {
      for (const flag of requirements.flags) {
        if (!this.gameState.flags.has(flag)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Process node effects
   * @param effects - Array of effects to process
   */
  private processNodeEffects(effects: NodeEffect[]): void {
    for (const effect of effects) {
      // Check probability
      if (effect.probability !== undefined) {
        const roll = Math.random();
        if (roll > effect.probability) {
          continue;
        }
      }

      switch (effect.type) {
        case "ADD_FLAG":
          this.gameState.flags.add(effect.target);
          this.chapterManager.addFlag(effect.target);
          break;

        case "REMOVE_FLAG":
          this.gameState.flags.delete(effect.target);
          this.chapterManager.removeFlag(effect.target);
          break;

        case "ADD_ITEM":
          if (!this.gameState.inventory.includes(effect.target)) {
            this.gameState.inventory.push(effect.target);
          }
          break;

        case "REMOVE_ITEM":
          const itemIndex = this.gameState.inventory.indexOf(effect.target);
          if (itemIndex >= 0) {
            this.gameState.inventory.splice(itemIndex, 1);
          }
          break;

        case "MODIFY_RELATIONSHIP":
          if (effect.value !== undefined) {
            const characterId = effect.target;
            const currentValue = this.gameState.relationships[characterId] || 0;
            this.gameState.relationships[characterId] =
              currentValue + effect.value;
            // Keep values within -100 to 100 range
            this.gameState.relationships[characterId] = Math.max(
              -100,
              Math.min(100, this.gameState.relationships[characterId])
            );
          }
          break;

        case "CHANGE_STAT":
          if (effect.value !== undefined) {
            const statName = effect.target;
            const currentValue = this.gameState.stats[statName] || 0;
            this.gameState.stats[statName] = currentValue + effect.value;
          }
          break;

        case "UNLOCK_CHAPTER":
          // This doesn't do anything directly since chapters are unlocked
          // based on flags and other requirements
          break;

        case "COMPLETE_OBJECTIVE":
          // Logic for completing objectives would go here
          break;

        case "TRIGGER_EVENT":
          // Logic for triggering events would go here
          break;

        case "CUSTOM":
          // Custom effects would be handled by game-specific code
          break;
      }

      // Display message if present
      if (effect.message) {
        console.log(effect.message);
        // In a real game, would display this in the UI
      }
    }
  }

  /**
   * Updates the game state
   * @param newState - Partial game state to apply
   */
  public updateGameState(newState: Partial<GameStateContext>): void {
    if (newState.playerLevel !== undefined) {
      this.gameState.playerLevel = newState.playerLevel;
      this.chapterManager.setPlayerLevel(newState.playerLevel);
    }

    if (newState.inventory !== undefined) {
      this.gameState.inventory = [...newState.inventory];
    }

    if (newState.skills !== undefined) {
      this.gameState.skills = { ...newState.skills };
    }

    if (newState.flags !== undefined) {
      this.gameState.flags = new Set(newState.flags);
      // Sync flags with chapter manager
      for (const flag of newState.flags) {
        this.chapterManager.addFlag(flag);
      }
    }

    if (newState.relationships !== undefined) {
      this.gameState.relationships = { ...newState.relationships };
    }

    if (newState.stats !== undefined) {
      this.gameState.stats = { ...newState.stats };
    }
  }

  /**
   * Gets the current game state
   * @returns The current game state
   */
  public getGameState(): GameStateContext {
    return {
      ...this.gameState,
      flags: new Set(this.gameState.flags),
    };
  }

  /**
   * Resets the node history
   */
  public resetHistory(): void {
    this.nodeHistory = [];
  }

  /**
   * Gets the node history
   * @returns Array of node IDs in history
   */
  public getNodeHistory(): string[] {
    return [...this.nodeHistory];
  }

  /**
   * Resets the game state
   */
  public resetGameState(): void {
    this.gameState = {
      playerLevel: 1,
      inventory: [],
      skills: {},
      flags: new Set<string>(),
      relationships: {},
      stats: {},
    };
    this.currentNode = null;
    this.nodeHistory = [];
  }
}
