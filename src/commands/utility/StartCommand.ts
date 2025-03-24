import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";

/**
 * Command to start the learning experience and launch the narrative
 */
export class StartCommand implements Command {
  public readonly name = "start";
  public readonly aliases = ["begin", "launch"];
  public readonly description = "Begin your CLI learning adventure";
  public readonly usage = "start";
  public readonly examples = ["start - Begin your journey"];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  constructor() {}

  public async execute(args: string[], context: any): Promise<CommandResult> {
    return {
      success: true,
      output: `
╔═══════════════════════════════════════════════════════════════════════════╗
║                       NEOTERMINAL: THE AWAKENING                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

Your neural interface blinks awake, bathing your dingy apartment in ghostly 
blue light. It's the third time this week you've been awakened by mysterious 
packet bursts coming through on frequencies that shouldn't exist.

"ATTENTION: CITIZEN #45601-B. QUANTUM SIGNATURE SCAN INDICATES POTENTIAL 
CHRONOS AFFINITY."

The message hovers in your field of vision, accompanied by a countdown timer. 
30 seconds to respond.

"ACKNOWLEDGE WITH PHRASE: 'I SEE THE CODE BEHIND THE WORLD' TO PROCEED."

> What would you like to do?
  (Type your response directly into the terminal)
  
  Tip: Type 'acknowledge' or 'ack' to respond with the required phrase.
  Or type the exact phrase 'I SEE THE CODE BEHIND THE WORLD' directly if preferred.
`,
    };
  }
}
