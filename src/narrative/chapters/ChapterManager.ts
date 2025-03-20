import { NarrativeChapter } from "./NarrativeChapter";
import { chapters as initialChapters } from "../data/chapters";

/**
 * Manages narrative chapters in the game
 */
export class ChapterManager {
  /** All loaded chapters */
  private chapters: Map<string, NarrativeChapter>;

  /** Player's completed chapter IDs */
  private completedChapters: Set<string>;

  /** Currently active chapter ID */
  private activeChapterId: string | null;

  /** Player's current level */
  private playerLevel: number;

  /** Game flags that may unlock chapters */
  private flags: Set<string>;

  /**
   * Creates a new ChapterManager
   */
  constructor() {
    this.chapters = new Map<string, NarrativeChapter>();
    this.completedChapters = new Set<string>();
    this.activeChapterId = null;
    this.playerLevel = 1;
    this.flags = new Set<string>();

    // Load initial chapters
    this.loadChapters(initialChapters);
  }

  /**
   * Loads chapters into the manager
   * @param chaptersToLoad - Array of chapters to load
   */
  public loadChapters(chaptersToLoad: NarrativeChapter[]): void {
    chaptersToLoad.forEach((chapter) => {
      this.chapters.set(chapter.id, chapter);
    });
  }

  /**
   * Adds a single chapter to the manager
   * @param chapter - Chapter to add
   */
  public addChapter(chapter: NarrativeChapter): void {
    this.chapters.set(chapter.id, chapter);
  }

  /**
   * Gets a chapter by ID
   * @param chapterId - ID of the chapter to retrieve
   * @returns The chapter or undefined if not found
   */
  public getChapter(chapterId: string): NarrativeChapter | undefined {
    return this.chapters.get(chapterId);
  }

  /**
   * Gets all loaded chapters
   * @returns Array of all chapters
   */
  public getAllChapters(): NarrativeChapter[] {
    return Array.from(this.chapters.values());
  }

  /**
   * Gets all chapters in order
   * @returns Array of chapters sorted by order property
   */
  public getOrderedChapters(): NarrativeChapter[] {
    return this.getAllChapters().sort((a, b) => a.order - b.order);
  }

  /**
   * Gets all chapters that are available to the player
   * based on completed chapters, player level, and flags
   * @returns Array of available chapters
   */
  public getAvailableChapters(): NarrativeChapter[] {
    return this.getAllChapters().filter((chapter) => {
      // Skip if already completed
      if (this.completedChapters.has(chapter.id)) {
        return false;
      }

      // Skip if no unlock requirements (shouldn't happen, but safeguard)
      if (!chapter.unlockRequirements) {
        return true;
      }

      const requirements = chapter.unlockRequirements;

      // Check player level requirement
      if (
        requirements.playerLevel &&
        this.playerLevel < requirements.playerLevel
      ) {
        return false;
      }

      // Check required completed chapters
      if (
        requirements.completedChapters &&
        requirements.completedChapters.length > 0
      ) {
        for (const requiredChapter of requirements.completedChapters) {
          if (!this.completedChapters.has(requiredChapter)) {
            return false;
          }
        }
      }

      // Check required flags
      if (requirements.flags && requirements.flags.length > 0) {
        for (const requiredFlag of requirements.flags) {
          if (!this.flags.has(requiredFlag)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Sets the active chapter
   * @param chapterId - ID of chapter to set as active
   * @returns True if chapter was found and set as active
   */
  public setActiveChapter(chapterId: string): boolean {
    if (this.chapters.has(chapterId)) {
      this.activeChapterId = chapterId;
      return true;
    }
    return false;
  }

  /**
   * Gets the active chapter
   * @returns The active chapter or undefined if none
   */
  public getActiveChapter(): NarrativeChapter | undefined {
    if (this.activeChapterId) {
      return this.chapters.get(this.activeChapterId);
    }
    return undefined;
  }

  /**
   * Marks a chapter as completed
   * @param chapterId - ID of chapter to mark completed
   * @returns True if chapter was found and marked
   */
  public completeChapter(chapterId: string): boolean {
    if (this.chapters.has(chapterId)) {
      this.completedChapters.add(chapterId);

      // If completed the active chapter, clear active
      if (this.activeChapterId === chapterId) {
        this.activeChapterId = null;
      }

      return true;
    }
    return false;
  }

  /**
   * Checks if a chapter is completed
   * @param chapterId - ID of chapter to check
   * @returns True if chapter is completed
   */
  public isChapterCompleted(chapterId: string): boolean {
    return this.completedChapters.has(chapterId);
  }

  /**
   * Gets array of completed chapter IDs
   * @returns Array of completed chapter IDs
   */
  public getCompletedChapters(): string[] {
    return Array.from(this.completedChapters);
  }

  /**
   * Sets the player's level
   * @param level - New player level
   */
  public setPlayerLevel(level: number): void {
    this.playerLevel = level;
  }

  /**
   * Gets the player's level
   * @returns Current player level
   */
  public getPlayerLevel(): number {
    return this.playerLevel;
  }

  /**
   * Adds a game flag
   * @param flag - Flag to add
   */
  public addFlag(flag: string): void {
    this.flags.add(flag);
  }

  /**
   * Removes a game flag
   * @param flag - Flag to remove
   */
  public removeFlag(flag: string): void {
    this.flags.delete(flag);
  }

  /**
   * Checks if a flag is set
   * @param flag - Flag to check
   * @returns True if flag is set
   */
  public hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  /**
   * Gets all set flags
   * @returns Array of set flags
   */
  public getAllFlags(): string[] {
    return Array.from(this.flags);
  }

  /**
   * Resets player progress (completed chapters, flags)
   * but keeps the loaded chapters
   */
  public resetProgress(): void {
    this.completedChapters.clear();
    this.activeChapterId = null;
    this.playerLevel = 1;
    this.flags.clear();
  }
}
