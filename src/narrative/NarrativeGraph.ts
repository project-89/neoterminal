import { NarrativeNode } from "./nodes/NarrativeNode";
import { NarrativeChapter } from "./chapters/NarrativeChapter";
import { EventTrigger } from "./events/StoryEvent";

// Helper type guard to check if a node has tags property
function hasTagsProperty(node: any): node is { tags: string[] } {
  return node && Array.isArray(node.tags);
}

// Helper type guard to check if node has metadata with tags
function hasMetadataTags(node: any): node is { metadata: { tags: string[] } } {
  return node && node.metadata && Array.isArray(node.metadata.tags);
}

/**
 * Manages the graph of narrative nodes and their connections
 */
export class NarrativeGraph {
  private nodes: Map<string, NarrativeNode> = new Map();
  private chapters: Map<string, NarrativeChapter> = new Map();
  private eventTriggers: Map<string, EventTrigger[]> = new Map();
  private nodesByTag: Map<string, string[]> = new Map();

  constructor() {
    // Load initial narrative data
    this.loadInitialData();
  }

  /**
   * Get a node by ID
   */
  public getNode(id: string): NarrativeNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get a chapter by ID
   */
  public getChapter(id: string): NarrativeChapter | undefined {
    return this.chapters.get(id);
  }

  /**
   * Get all nodes
   */
  public getAllNodes(): NarrativeNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all chapters
   */
  public getAllChapters(): NarrativeChapter[] {
    return Array.from(this.chapters.values());
  }

  /**
   * Add a narrative node
   */
  public addNode(node: NarrativeNode): void {
    this.nodes.set(node.id, node);

    // Index node by tags - handle different node structures
    if (hasMetadataTags(node)) {
      for (const tag of node.metadata.tags) {
        const nodesWithTag = this.nodesByTag.get(tag) || [];
        nodesWithTag.push(node.id);
        this.nodesByTag.set(tag, nodesWithTag);
      }
    } else if (hasTagsProperty(node)) {
      for (const tag of node.tags) {
        const nodesWithTag = this.nodesByTag.get(tag) || [];
        nodesWithTag.push(node.id);
        this.nodesByTag.set(tag, nodesWithTag);
      }
    }
  }

  /**
   * Add a chapter
   */
  public addChapter(chapter: NarrativeChapter): void {
    this.chapters.set(chapter.id, chapter);
  }

  /**
   * Add an event trigger
   */
  public addEventTrigger(trigger: EventTrigger): void {
    const triggers = this.eventTriggers.get(trigger.eventType) || [];
    triggers.push(trigger);

    // Sort by priority (higher first)
    triggers.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.eventTriggers.set(trigger.eventType, triggers);
  }

  /**
   * Get triggers for an event type
   */
  public getEventTriggers(eventType: string): EventTrigger[] | undefined {
    return this.eventTriggers.get(eventType);
  }

  /**
   * Find nodes by tag
   */
  public findNodesByTag(tag: string): NarrativeNode[] {
    const nodeIds = this.nodesByTag.get(tag) || [];
    return nodeIds
      .map((id) => this.nodes.get(id))
      .filter((node): node is NarrativeNode => node !== undefined);
  }

  /**
   * Load initial narrative data
   */
  private loadInitialData(): void {
    // Import and load initial chapters
    import("./data/chapters")
      .then(({ chapters }) => {
        for (const chapter of chapters) {
          this.addChapter(chapter);
        }
      })
      .catch((error) => {
        console.error("Failed to load chapters:", error);
      });

    // Import and load initial nodes
    import("./data/narrative-nodes")
      .then(({ narrativeNodes }) => {
        for (const node of narrativeNodes) {
          this.addNode(node);
        }
      })
      .catch((error) => {
        console.error("Failed to load narrative nodes:", error);
      });

    // Import and load event triggers
    import("./data/event-triggers")
      .then(({ eventTriggers }) => {
        for (const trigger of eventTriggers) {
          this.addEventTrigger(trigger);
        }
      })
      .catch((error) => {
        console.error("Failed to load event triggers:", error);
      });
  }

  /**
   * Find nodes connected to a given node
   */
  public findConnectedNodes(nodeId: string): NarrativeNode[] {
    const node = this.getNode(nodeId);
    if (!node) return [];

    const connectedNodes: NarrativeNode[] = [];

    // Check linear connection using type guard
    if (node && "next" in node && typeof node.next === "string") {
      const nextNode = this.getNode(node.next);
      if (nextNode) {
        connectedNodes.push(nextNode);
      }
    }

    // Check choice connections
    if (node.choices) {
      for (const choice of node.choices) {
        // Handle both versions of the choice property (targetNode and nextNodeId)
        let targetId: string | undefined;

        if ("targetNode" in choice && typeof choice.targetNode === "string") {
          targetId = choice.targetNode;
        } else if (
          "nextNodeId" in choice &&
          typeof choice.nextNodeId === "string"
        ) {
          targetId = choice.nextNodeId;
        }

        if (targetId) {
          const targetNode = this.getNode(targetId);
          if (targetNode) {
            connectedNodes.push(targetNode);
          }
        }
      }
    }

    return connectedNodes;
  }

  /**
   * Find the shortest path between two nodes
   */
  public findPath(startNodeId: string, endNodeId: string): string[] | null {
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [
      { nodeId: startNodeId, path: [startNodeId] },
    ];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === endNodeId) {
        return path;
      }

      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);
      const connectedNodes = this.findConnectedNodes(nodeId);

      for (const node of connectedNodes) {
        if (!visited.has(node.id)) {
          queue.push({
            nodeId: node.id,
            path: [...path, node.id],
          });
        }
      }
    }

    return null; // No path found
  }
}
