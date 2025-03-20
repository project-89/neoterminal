/**
 * Web Narrative Bridge
 *
 * This file serves as a bridge between the TypeScript narrative system
 * and the web interface. It provides a simplified API that can be used
 * in the browser without requiring TypeScript compilation.
 */

class WebNarrativeManager {
  constructor() {
    this.currentChapter = null;
    this.currentNode = null;
    this.characters = new Map();
    this.chapters = new Map();
    this.nodes = new Map();
    this.playerState = this.createDefaultPlayerState();

    // Load initial data
    this.loadData();
  }

  /**
   * Initialize with default player state
   */
  createDefaultPlayerState() {
    return {
      hackingSkill: 1,
      reputation: 0,
      corporateAlert: 0,
      factionStanding: new Map(),
      inventory: [],
      discoveredLocations: [],
      completedMissions: [],
      knownCharacters: [],
      unlockedSkills: [],
      flags: new Set(),
      storyVariables: new Map(),
    };
  }

  /**
   * Load narrative data (characters, chapters, nodes)
   */
  loadData() {
    // In a production version, this would load data from JSON files or an API
    // For demonstration purposes, we'll hardcode some data

    // Add characters
    this.addCharacter({
      id: "char_001",
      name: "CIPHER",
      faction: "GHOST//SIGNAL",
      role: "Leader",
      relationshipWithPlayer: 0,
    });

    this.addCharacter({
      id: "char_002",
      name: "ECHO",
      faction: "GHOST//SIGNAL",
      role: "Handler",
      relationshipWithPlayer: 10,
    });

    // Add chapters
    this.addChapter({
      id: "chapter_001",
      title: "The Awakening",
      description:
        "Your journey begins as you discover the truth about PANOPTICON's surveillance system and join the GHOST//SIGNAL collective.",
      order: 1,
      startingNodeId: "node_001_intro",
    });

    // Add nodes
    this.addNode({
      id: "node_001_intro",
      title: "An Unexpected Message",
      content: `Your terminal blinks with an incoming message. Strange, you weren't expecting any communications on this secure channel.
        
"ATTENTION: CITIZEN #45601-B. YOUR DIGITAL FOOTPRINT HAS BEEN FLAGGED FOR REVIEW."

The message freezes your blood. A PANOPTICON notice - the ubiquitous surveillance system that monitors all digital activity. What did you do to trigger this?

Before you can process your thoughts, the message flickers and changes:

"DISREGARD PREVIOUS MESSAGE. SECURE CONNECTION ESTABLISHED. 

We've been watching you. Your skills are impressive. Not many can bypass a level-3 security node without triggering alarms. We have a proposition for you."`,
      chapterId: "chapter_001",
      choices: [
        {
          id: "choice_001_a",
          text: '"Who is this? How did you access my secure terminal?"',
          nextNodeId: "node_001_who",
        },
        {
          id: "choice_001_b",
          text: '"I\'m listening. What kind of proposition?"',
          nextNodeId: "node_001_proposition",
        },
        {
          id: "choice_001_c",
          text: "Terminate the connection immediately",
          nextNodeId: "node_001_terminate",
        },
      ],
    });

    // Additional nodes would be added here
  }

  /**
   * Add a character to the system
   */
  addCharacter(character) {
    this.characters.set(character.id, character);
  }

  /**
   * Add a chapter to the system
   */
  addChapter(chapter) {
    this.chapters.set(chapter.id, chapter);
  }

  /**
   * Add a node to the system
   */
  addNode(node) {
    this.nodes.set(node.id, node);
  }

  /**
   * Start a chapter by ID
   */
  startChapter(chapterId) {
    const chapter = this.chapters.get(chapterId);
    if (!chapter) {
      console.error(`Chapter not found: ${chapterId}`);
      return false;
    }

    this.currentChapter = chapter;
    return this.goToNode(chapter.startingNodeId);
  }

  /**
   * Go to a specific node by ID
   */
  goToNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      console.error(`Node not found: ${nodeId}`);
      return false;
    }

    this.currentNode = node;
    return true;
  }

  /**
   * Make a choice by ID
   */
  makeChoice(choiceId) {
    if (!this.currentNode || !this.currentNode.choices) {
      return false;
    }

    const choice = this.currentNode.choices.find((c) => c.id === choiceId);
    if (!choice) {
      console.error(`Choice not found: ${choiceId}`);
      return false;
    }

    return this.goToNode(choice.nextNodeId);
  }

  /**
   * Get the current node
   */
  getCurrentNode() {
    return this.currentNode;
  }

  /**
   * Get the current chapter
   */
  getCurrentChapter() {
    return this.currentChapter;
  }

  /**
   * Get a character by ID
   */
  getCharacter(characterId) {
    return this.characters.get(characterId) || null;
  }

  /**
   * Get the current speaker (if the current node has a speakerId)
   */
  getCurrentSpeaker() {
    if (!this.currentNode || !this.currentNode.speakerId) {
      return null;
    }

    return this.getCharacter(this.currentNode.speakerId);
  }

  /**
   * Get available choices for the current node
   */
  getAvailableChoices() {
    if (!this.currentNode || !this.currentNode.choices) {
      return [];
    }

    // In a full implementation, we would filter choices based on requirements
    return this.currentNode.choices;
  }

  /**
   * Set a flag in the player state
   */
  setFlag(flag) {
    this.playerState.flags.add(flag);
  }

  /**
   * Check if a flag is set
   */
  hasFlag(flag) {
    return this.playerState.flags.has(flag);
  }

  /**
   * Add an item to the player's inventory
   */
  addInventoryItem(item) {
    if (!this.playerState.inventory.includes(item)) {
      this.playerState.inventory.push(item);
    }
  }
}

// Export the class for use in the narrative viewer
if (typeof window !== "undefined") {
  window.WebNarrativeManager = WebNarrativeManager;
}
