import { EventEmitter } from "events";
import { AIServiceManager } from "../ai/AIServiceManager";
import { NarrativeNode } from "./NarrativeNode";
import { NarrativeGraph } from "./NarrativeGraph";
import { PlayerState } from "./PlayerState";
import { StoryEvent } from "./events/StoryEvent";
import { Character } from "./characters/Character";
import { NarrativeChapter } from "./chapters/NarrativeChapter";
import { NarrativeChoice } from "./NarrativeChoice";
import { CharacterManager } from "./characters/CharacterManager";

/**
 * Core narrative system that manages story progression and generates narrative content
 */
export class NarrativeSystem extends EventEmitter {
  private currentNode: NarrativeNode | null = null;
  private narrativeGraph: NarrativeGraph;
  private playerState: PlayerState;
  private characterManager: CharacterManager;
  private currentChapter: NarrativeChapter | null = null;
  private nodeHistory: string[] = [];
  private eventLog: StoryEvent[] = [];
  private dynamicContentCache: Map<string, string> = new Map();
  private lastUpdateTimestamp: number = Date.now();

  constructor() {
    super();
    this.narrativeGraph = new NarrativeGraph();
    this.playerState = new PlayerState();
    this.characterManager = new CharacterManager();
  }

  /**
   * Initialize the narrative system with the starting node
   */
  public async initialize(startNodeId: string): Promise<boolean> {
    try {
      // Load the starting node
      const startNode = this.narrativeGraph.getNode(startNodeId);
      if (!startNode) {
        throw new Error(`Starting node ${startNodeId} not found`);
      }

      this.currentNode = startNode;
      this.nodeHistory.push(startNodeId);

      // Setup initial player state
      this.playerState.initialize({
        hackingSkill: 1,
        reputation: 0,
        corporateAlert: 0,
        factionStanding: new Map([
          ["ghost_signal", 10],
          ["corporate", -5],
          ["netrunners", 0],
          ["blackmarket", 0],
        ]),
        inventory: ["basic_deck", "id_chip"],
        discoveredLocations: ["home_terminal"],
        completedMissions: [],
        knownCharacters: ["handler"],
        unlockedSkills: ["basic_navigation"],
        flags: new Set(["new_recruit"]),
        storyVariables: new Map([
          ["handler_name", "SYNTAX"],
          ["player_alias", "GHOST"],
        ]),
      });

      // Trigger the initial scene
      await this.processCurrentNode();

      return true;
    } catch (error) {
      console.error("Failed to initialize narrative system:", error);
      return false;
    }
  }

  /**
   * Process the current narrative node and generate content
   */
  private async processCurrentNode(): Promise<void> {
    if (!this.currentNode) return;

    // Check if we're entering a new chapter
    if (
      this.currentNode.chapterId &&
      (!this.currentChapter ||
        this.currentNode.chapterId !== this.currentChapter.id)
    ) {
      const newChapter = this.narrativeGraph.getChapter(
        this.currentNode.chapterId
      );
      if (newChapter) {
        this.currentChapter = newChapter;
        this.emit("chapter-changed", { chapter: newChapter });
      }
    }

    // Generate narrative content
    const content = await this.generateNodeContent(this.currentNode);

    // Process node actions/effects
    this.processNodeEffects(this.currentNode);

    // Check if there are any characters to introduce
    if (this.currentNode.characters && this.currentNode.characters.length > 0) {
      for (const characterId of this.currentNode.characters) {
        const character = this.characterManager.getCharacter(characterId);
        if (
          character &&
          !this.playerState.knownCharacters.includes(characterId)
        ) {
          this.playerState.knownCharacters.push(characterId);
          this.emit("character-introduced", { character });
        }
      }
    }

    // Update last interaction time
    this.lastUpdateTimestamp = Date.now();

    // Emit content update event
    this.emit("narrative-updated", {
      nodeId: this.currentNode.id,
      content,
      choices: this.currentNode.choices || [],
      characters: this.currentNode.characters || [],
    });
  }

  /**
   * Generate narrative content for a node, potentially using AI
   */
  private async generateNodeContent(node: NarrativeNode): Promise<string> {
    // If the node has static content, use that
    if (node.content) {
      return this.processTemplateVariables(node.content);
    }

    // If we have cached dynamic content, use that
    if (this.dynamicContentCache.has(node.id)) {
      return this.dynamicContentCache.get(node.id)!;
    }

    // Otherwise, generate dynamic content using AI service
    try {
      if (AIServiceManager.hasInitializedService()) {
        const aiService = AIServiceManager.getCurrentService();
        const context = {
          playerState: this.playerState.getState(),
          currentNode: node,
          nodeHistory: this.nodeHistory.slice(-5),
          currentChapter: this.currentChapter,
          characters:
            node.characters?.map((id) =>
              this.characterManager.getCharacter(id)
            ) || [],
        };

        // Use the AI to generate narrative content
        const narrativeResponse = await aiService.generateNarrative(context);

        // Cache the generated content
        this.dynamicContentCache.set(node.id, narrativeResponse);

        return narrativeResponse;
      } else {
        // Fallback if no AI service is available
        return `[Node: ${node.id}] Narrative content would be generated here.`;
      }
    } catch (error) {
      console.error("Error generating narrative content:", error);
      return `[System Error: Unable to generate narrative content for node ${node.id}]`;
    }
  }

  /**
   * Process template variables in content
   */
  private processTemplateVariables(content: string): string {
    let processedContent = content;

    // Replace state variables
    for (const [key, value] of this.playerState.storyVariables.entries()) {
      processedContent = processedContent.replace(
        new RegExp(`{{${key}}}`, "g"),
        String(value)
      );
    }

    // Replace system variables
    processedContent = processedContent.replace(
      /{{current_time}}/g,
      new Date().toLocaleTimeString()
    );

    // Replace character references
    const characterRegex = /{{character:([a-z_]+)}}/g;
    let match;
    while ((match = characterRegex.exec(processedContent)) !== null) {
      const characterId = match[1];
      const character = this.characterManager.getCharacter(characterId);
      const replacement = character ? character.name : "[UNKNOWN]";
      processedContent = processedContent.replace(match[0], replacement);
    }

    return processedContent;
  }

  /**
   * Process the effects/actions of the current node on player state
   */
  private processNodeEffects(node: NarrativeNode): void {
    if (!node.effects) return;

    for (const effect of node.effects) {
      switch (effect.type) {
        case "modify_stat":
          this.playerState.modifyStat(effect.stat, effect.value);
          break;

        case "add_item":
          this.playerState.addInventoryItem(effect.item);
          break;

        case "remove_item":
          this.playerState.removeInventoryItem(effect.item);
          break;

        case "set_flag":
          this.playerState.setFlag(effect.flag);
          break;

        case "clear_flag":
          this.playerState.clearFlag(effect.flag);
          break;

        case "modify_faction":
          this.playerState.modifyFactionStanding(effect.faction, effect.value);
          break;

        case "set_variable":
          this.playerState.setStoryVariable(effect.key, effect.value);
          break;

        case "add_event":
          this.logEvent({
            type: effect.eventType,
            timestamp: Date.now(),
            details: effect.details || {},
          });
          break;
      }
    }
  }

  /**
   * Navigate to a new node
   */
  public async goToNode(nodeId: string): Promise<boolean> {
    try {
      const node = this.narrativeGraph.getNode(nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }

      // Check if this node has requirements
      if (node.requirements && !this.checkNodeRequirements(node)) {
        this.emit("requirements-not-met", {
          nodeId,
          requirements: node.requirements,
        });
        return false;
      }

      // If we're navigating to a new node, log it as an event
      if (this.currentNode && this.currentNode.id !== nodeId) {
        this.logEvent({
          type: "node_transition",
          timestamp: Date.now(),
          details: {
            fromNode: this.currentNode.id,
            toNode: nodeId,
          },
        });
      }

      this.currentNode = node;
      this.nodeHistory.push(nodeId);

      // Process the new current node
      await this.processCurrentNode();

      return true;
    } catch (error) {
      console.error("Error navigating to node:", error);
      return false;
    }
  }

  /**
   * Check if player meets the requirements for a node
   */
  private checkNodeRequirements(node: NarrativeNode): boolean {
    if (!node.requirements) return true;

    const requirements = node.requirements;
    const state = this.playerState;

    // Check minimum skill level
    if (
      requirements.minHackingSkill &&
      state.hackingSkill < requirements.minHackingSkill
    ) {
      return false;
    }

    // Check required items
    if (requirements.requiredItems) {
      for (const item of requirements.requiredItems) {
        if (!state.inventory.includes(item)) {
          return false;
        }
      }
    }

    // Check required flags
    if (requirements.requiredFlags) {
      for (const flag of requirements.requiredFlags) {
        if (!state.flags.has(flag)) {
          return false;
        }
      }
    }

    // Check faction standings
    if (requirements.factionStandings) {
      for (const [faction, minStanding] of Object.entries(
        requirements.factionStandings
      )) {
        const currentStanding = state.factionStanding.get(faction) || 0;
        if (currentStanding < minStanding) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Make a choice from the current node
   */
  public async makeChoice(choiceId: string): Promise<boolean> {
    if (!this.currentNode || !this.currentNode.choices) {
      return false;
    }

    const choice = this.currentNode.choices.find((c) => c.id === choiceId);
    if (!choice) {
      return false;
    }

    // Log the choice as an event
    this.logEvent({
      type: "player_choice",
      timestamp: Date.now(),
      details: {
        nodeId: this.currentNode.id,
        choiceId: choiceId,
        choiceText: choice.text,
      },
    });

    // Process any effects from the choice
    if (choice.effects) {
      for (const effect of choice.effects) {
        // Same effect processing as in processNodeEffects
        switch (effect.type) {
          case "modify_stat":
            this.playerState.modifyStat(effect.stat, effect.value);
            break;

          case "add_item":
            this.playerState.addInventoryItem(effect.item);
            break;

          // ... handle other effect types
        }
      }
    }

    // Navigate to the target node
    return this.goToNode(choice.targetNode);
  }

  /**
   * Trigger a story event that might affect narrative progression
   */
  public async triggerEvent(
    eventType: string,
    details: any = {}
  ): Promise<void> {
    const event: StoryEvent = {
      type: eventType,
      timestamp: Date.now(),
      details,
    };

    this.logEvent(event);

    // Check if this event should trigger a narrative branch
    const triggers = this.narrativeGraph.getEventTriggers(eventType);
    if (triggers && triggers.length > 0) {
      for (const trigger of triggers) {
        // Check if the trigger conditions are met
        if (this.checkTriggerConditions(trigger.conditions, event)) {
          // Navigate to the target node
          await this.goToNode(trigger.targetNode);
          break; // Only process the first matching trigger
        }
      }
    }
  }

  /**
   * Check if trigger conditions are met
   */
  private checkTriggerConditions(conditions: any, event: StoryEvent): boolean {
    if (!conditions) return true;

    // Check event-specific conditions
    if (conditions.details) {
      for (const [key, value] of Object.entries(conditions.details)) {
        if (event.details[key] !== value) {
          return false;
        }
      }
    }

    // Check player state conditions
    if (conditions.playerState) {
      // Check minimum hacking skill
      if (
        conditions.playerState.minHackingSkill &&
        this.playerState.hackingSkill < conditions.playerState.minHackingSkill
      ) {
        return false;
      }

      // Check flags
      if (conditions.playerState.flags) {
        for (const flag of conditions.playerState.flags) {
          if (!this.playerState.flags.has(flag)) {
            return false;
          }
        }
      }

      // Additional player state checks can be added here
    }

    return true;
  }

  /**
   * Log a story event
   */
  private logEvent(event: StoryEvent): void {
    this.eventLog.push(event);
    this.emit("story-event", event);

    // Keep the event log from growing too large
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(-100);
    }
  }

  /**
   * Save the current narrative state
   */
  public saveState(): object {
    return {
      currentNodeId: this.currentNode?.id,
      currentChapterId: this.currentChapter?.id,
      nodeHistory: this.nodeHistory,
      playerState: this.playerState.getState(),
      eventLog: this.eventLog,
      lastUpdateTimestamp: this.lastUpdateTimestamp,
    };
  }

  /**
   * Load a saved narrative state
   */
  public async loadState(state: any): Promise<boolean> {
    try {
      this.nodeHistory = state.nodeHistory || [];
      this.playerState.loadState(state.playerState);
      this.eventLog = state.eventLog || [];
      this.lastUpdateTimestamp = state.lastUpdateTimestamp || Date.now();

      // Load the current chapter
      if (state.currentChapterId) {
        this.currentChapter = this.narrativeGraph.getChapter(
          state.currentChapterId
        );
      }

      // Navigate to the current node
      if (state.currentNodeId) {
        await this.goToNode(state.currentNodeId);
      }

      return true;
    } catch (error) {
      console.error("Error loading narrative state:", error);
      return false;
    }
  }

  /**
   * Get available choices for the current node
   */
  public getCurrentChoices(): NarrativeChoice[] {
    if (!this.currentNode || !this.currentNode.choices) {
      return [];
    }

    // Filter choices based on requirements
    return this.currentNode.choices.filter((choice) => {
      // If there are no requirements, the choice is available
      if (!choice.requirements) return true;

      // Check if player meets the requirements
      const requirements = choice.requirements;

      // Check minimum skill level
      if (
        requirements.minHackingSkill &&
        this.playerState.hackingSkill < requirements.minHackingSkill
      ) {
        return false;
      }

      // Check required items
      if (requirements.requiredItems) {
        for (const item of requirements.requiredItems) {
          if (!this.playerState.inventory.includes(item)) {
            return false;
          }
        }
      }

      // Check required flags
      if (requirements.requiredFlags) {
        for (const flag of requirements.requiredFlags) {
          if (!this.playerState.flags.has(flag)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Get the current player state
   */
  public getPlayerState(): PlayerState {
    return this.playerState;
  }

  /**
   * Get info about current chapter
   */
  public getCurrentChapter(): NarrativeChapter | null {
    return this.currentChapter;
  }

  /**
   * Get a character by ID
   */
  public getCharacter(characterId: string): Character | null {
    return this.characterManager.getCharacter(characterId);
  }
}
