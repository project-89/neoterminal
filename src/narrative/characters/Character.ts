/**
 * Interface representing a narrative character
 */
export interface Character {
  /** Unique identifier for the character */
  id: string;

  /** The character's name */
  name: string;

  /** Description of the character */
  description: string;

  /** The faction the character belongs to */
  faction: string;

  /** The character's role within their faction */
  role: string;

  /** Optional path to character avatar image */
  avatar?: string;

  /** Array of personality traits */
  personality?: string[];

  /** Relationship score with player (-100 to 100) */
  relationshipWithPlayer?: number;

  /** Description of how the character speaks */
  dialogueStyle?: string;

  /** Character's history */
  backstory?: string;

  /** Character's goals and drives */
  motivations?: string;

  /** Locations the character is known to frequent */
  knownLocations?: string[];

  /** Items the character possesses */
  inventory?: string[];

  /** Additional metadata about the character */
  metadata?: {
    /** First chapter where this character appears */
    firstAppearance?: string;

    /** Whether this is a major character in the narrative */
    isMajorCharacter?: boolean;

    /** Whether this character serves as a mentor figure */
    isMentorFigure?: boolean;

    /** Whether this character is an antagonist */
    isAntagonist?: boolean;

    /** Character's voice description */
    voiceProfile?: string;

    /** Any other character-specific metadata */
    [key: string]: any;
  };
}
