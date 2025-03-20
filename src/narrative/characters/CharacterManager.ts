import { Character } from "./Character";
import { EventEmitter } from "events";
import { characters as initialCharacters } from "../data/characters";

/**
 * Manages characters in the narrative
 */
export class CharacterManager extends EventEmitter {
  private characters: Map<string, Character> = new Map();
  private charactersByFaction: Map<string, string[]> = new Map();
  private characterRelationships: Map<string, Map<string, number>> = new Map();

  constructor() {
    super();
    this.loadCharacters(initialCharacters);
  }

  /**
   * Load initial characters
   */
  private async initializeCharacters(
    charactersToLoad: Character[]
  ): Promise<void> {
    try {
      for (const character of charactersToLoad) {
        this.addCharacter(character);
      }

      this.emit("characters-loaded", { count: charactersToLoad.length });
    } catch (error) {
      console.error("Failed to load characters:", error);
    }
  }

  /**
   * Add a character
   */
  public addCharacter(character: Character): void {
    this.characters.set(character.id, character);

    // Index by faction
    const factionChars = this.charactersByFaction.get(character.faction) || [];
    factionChars.push(character.id);
    this.charactersByFaction.set(character.faction, factionChars);

    // Initialize relationship map
    this.characterRelationships.set(character.id, new Map());

    this.emit("character-added", { character });
  }

  /**
   * Get a character by ID
   */
  public getCharacter(id: string): Character | null {
    return this.characters.get(id) || null;
  }

  /**
   * Get all characters
   */
  public getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  /**
   * Get characters by faction
   */
  public getCharactersByFaction(faction: string): Character[] {
    const charIds = this.charactersByFaction.get(faction) || [];
    return charIds
      .map((id) => this.characters.get(id))
      .filter((char): char is Character => !!char);
  }

  /**
   * Set relationship between two characters
   */
  public setCharacterRelationship(
    char1Id: string,
    char2Id: string,
    value: number
  ): void {
    const relationshipsFor1 = this.characterRelationships.get(char1Id);
    const relationshipsFor2 = this.characterRelationships.get(char2Id);

    if (relationshipsFor1 && relationshipsFor2) {
      // Relationship values are between -100 and 100
      const clampedValue = Math.max(-100, Math.min(100, value));

      relationshipsFor1.set(char2Id, clampedValue);
      relationshipsFor2.set(char1Id, clampedValue);

      this.emit("relationship-changed", {
        char1Id,
        char2Id,
        value: clampedValue,
      });
    }
  }

  /**
   * Loads characters from an array
   * @param charactersToLoad - Array of characters to load
   */
  public loadCharacters(charactersToLoad: Character[]): void {
    charactersToLoad.forEach((char) => {
      this.addCharacter(char);
    });
  }

  /**
   * Gets the relationship value between a character and the player
   * @param characterId - ID of the character
   * @param defaultValue - Default value to return if character not found
   * @returns Relationship value (-100 to 100)
   */
  public getCharacterRelationship(
    characterId: string,
    defaultValue: number = 0
  ): number {
    const character = this.getCharacter(characterId);
    return character?.relationshipWithPlayer ?? defaultValue;
  }

  /**
   * Update a character
   */
  public updateCharacter(id: string, updates: Partial<Character>): void {
    const character = this.characters.get(id);

    if (character) {
      // Update character properties
      Object.assign(character, updates);

      // If faction changed, update faction indices
      if (updates.faction && updates.faction !== character.faction) {
        // Remove from old faction
        const oldFactionChars =
          this.charactersByFaction.get(character.faction) || [];
        const updatedOldFaction = oldFactionChars.filter(
          (charId) => charId !== id
        );
        this.charactersByFaction.set(character.faction, updatedOldFaction);

        // Add to new faction
        const newFactionChars =
          this.charactersByFaction.get(updates.faction) || [];
        newFactionChars.push(id);
        this.charactersByFaction.set(updates.faction, newFactionChars);
      }

      this.emit("character-updated", { character });
    }
  }

  /**
   * Gets relationship between two characters
   * @param char1Id - ID of first character
   * @param char2Id - ID of second character
   * @returns Relationship value (-100 to 100)
   */
  public getRelationshipBetweenCharacters(
    char1Id: string,
    char2Id: string
  ): number {
    const relationshipsFor1 = this.characterRelationships.get(char1Id);
    return relationshipsFor1 ? relationshipsFor1.get(char2Id) || 0 : 0;
  }
}
