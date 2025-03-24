# NEOTERMINAL // NARRATIVE DATA SYSTEM

## Overview

The Narrative Data System manages the interactive storytelling aspect of NEOTERMINAL. It provides a framework for creating branching narratives that teach command-line interface (CLI) skills through an engaging cyberpunk story.

## Directory Structure

- `/chapters/` - Contains narrative nodes organized by chapter
  - `chapter1.ts` - Chapter 1: The Awakening
  - `chapter2.ts` - Chapter 2: Digital Footprints
  - `chapter3.ts` - Chapter 3: The Data Heist
  - `chapter4.ts` - Chapter 4: Digital Underground
  - `chapter5.ts` - Chapter 5: Corporate Infiltration
  - `index.ts` - Entry point that exports all chapters and combined nodes

- `characters.ts` - Defines all characters in the narrative
- `chapters.ts` - Defines chapter metadata and structure
- `narrative-nodes.ts` - Main export point for narrative data

## Command Integration

A key feature of NEOTERMINAL is the integration of actual CLI commands within the narrative. Rather than simply selecting numbered choices, players often must type real terminal commands to advance the story.

### Command-based Choices

Command-based choices are implemented using the `requires_command` property:

```typescript
{
  id: "choice_123",
  text: "Enter the command: ls",
  targetNode: "node_result",
  requires_command: "ls",
  metadata: {
    tooltipText: "Type 'ls' directly in the terminal to proceed",
    commandChoice: true
  }
}
```

When a choice has the `requires_command` property:
- The system waits for the player to type that exact command
- Numeric selection (1, 2, 3) will not work
- The command must be entered precisely as specified

### Command Learning Progression

The narrative is structured to teach commands in a logical progression:

1. **Chapter 1:** Basic navigation (ls, cd, cat)
2. **Chapter 2:** Connection and search (ssh, grep, find)
3. **Chapter 3:** File manipulation (cp, mv, rm)
4. **Chapter 4:** Text processing (head, tail, sort)
5. **Chapter 5:** Advanced operations (chmod, ps, netstat)

### Adding New Command-based Nodes

When adding new narrative nodes with command requirements:

1. Use the `requires_command` property for choices that need command input
2. Add `metadata.commandChoice = true` for UI differentiation
3. Include clear examples in the narrative content (using code blocks)
4. Consider varying difficulty based on chapter context
5. Provide appropriate feedback for incorrect commands

## Example Command Integration

```typescript
{
  id: "node_example",
  type: "dialogue",
  title: "Finding Information",
  content: 
    'ECHO points to a massive database. "We need to find all files referencing Project ORACLE. Try using grep to search."\n\n```\ngrep -r "ORACLE" /data/\n```',
  choices: [
    {
      id: "choice_example_a",
      text: "Search for Project ORACLE references",
      targetNode: "node_search_result",
      requires_command: 'grep -r "ORACLE" /data/',
      metadata: {
        tooltipText: "Type the grep command as shown to search the database",
        commandChoice: true
      }
    }
  ]
}
```

## Best Practices

1. Keep command requirements consistent with the narrative context
2. Start with simple commands and gradually increase complexity
3. Ensure all required commands are introduced and explained
4. Include alternative dialogue options for players who want more guidance
5. Provide clear feedback for successful command execution
6. Consider allowing similar command variations (e.g., with/without flags)

## Testing

To test narrative nodes with command requirements, use:

```
npm run narrative
```

When prompted for command-based choices, type the actual command rather than selecting by number. 