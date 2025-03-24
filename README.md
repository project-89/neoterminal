# NEOTERMINAL

```
 _   _   _____   _____   _____   _____   ____    __  __   _   _   _     _    _
| \ | | |  ___| |  _  | |_   _| |  ___| |  _ \  |  \/  | |_| | \ | |   / \  | |    
|  \| | | |__   | | | |   | |   | |__   | |_| | | |\/| | | | |  \| |  / _ \ | |    
| |\  | |  __|  | |_| |   | |   |  __|  |  _ <  | |  | | | | | |\  | / ___ \| |___ 
|_| \_| |_____|  \___/    |_|   |_____| |_| \_\ |_|  |_| |_| |_| \_|/_/   \_\_____|
```

## //> SYSTEM BRIEFING

NEOTERMINAL is a cyberpunk hacker simulation designed to teach command line interfaces through an immersive narrative experience. Users learn terminal commands while completing "hacker missions" in a dystopian future setting.

## //> MISSION OBJECTIVE

Transform CLI neophytes into terminal masters through immersive missions in a cyberpunk world. The system adapts to the user's skill level, introducing new commands gradually as they demonstrate proficiency.

## //> FEATURES

- **Immersive Terminal Experience**: A custom terminal interface with cyberpunk aesthetics
- **Virtual Filesystem**: A secure sandbox for experimenting with commands
- **Progressive Mission System**: Learn commands through narrative-driven objectives
- **Skill Tracking**: AI-driven system that monitors command proficiency
- **Cyberpunk Narrative**: Engaging story that frames the learning experience
- **AI Integration**: Real API connections to Claude, Gemini, or local offline mode

## //> QUICK START

```bash
# Clone the repo
git clone https://github.com/ghost-signal/neoterminal.git

# Enter the directory
cd neoterminal

# Install dependencies
npm install

# Start NEOTERMINAL with the default local AI provider (no API key required)
npm start

# Or run with a specific AI provider (examples):
AI_PROVIDER=claude CLAUDE_API_KEY=your_api_key npm start
AI_PROVIDER=gemini GEMINI_API_KEY=your_api_key npm start
AI_PROVIDER=openai OPENAI_API_KEY=your_api_key npm start
```

## //> AI ASSISTANT CONFIGURATION

NEOTERMINAL's AI assistant helps you learn command line skills through personalized guidance. You can choose from multiple AI providers or use the offline mode.

### Configuration Methods

The AI service can be configured in three ways, in order of precedence:

1. **Configuration File**: Create an `ai-config.json` file in one of these locations:
   - Custom path specified by `AI_CONFIG_PATH` environment variable
   - Current directory (`./ai-config.json`)
   - User's home directory (`~/.neoterminal/ai-config.json`)

2. **Environment Variables**:
   - `AI_PROVIDER`: Service provider (`claude`, `gemini`, `openai`, or `local` - default is `local`)
   - Provider-specific API keys (in order of preference):
     - For OpenAI: `OPENAI_API_KEY`
     - For Claude: `CLAUDE_API_KEY`
     - For Gemini: `GEMINI_API_KEY`
   - Generic key: `AI_API_KEY` (fallback for any provider if specific key not found)
   - `AI_MODEL`: Specific model to use (provider-specific)
   - `AI_TEMPERATURE`: Response creativity (0.0-1.0, default 0.7)
   - `AI_MAX_TOKENS`: Maximum tokens in responses (default 1000)

3. **Default Configuration**: If no custom config is found, the system uses the local provider which works offline without an API key.

### Sample Configuration File

Create an `ai-config.json` file with content like this:

```json
{
  "provider": "claude",
  "apiKey": "your_api_key_here",
  "model": "claude-3-sonnet-20240229",
  "temperature": 0.7,
  "maxTokens": 500
}
```

### AI Provider Options

- **Local**: Offline mode with pre-defined responses (no API key required)
  - Great for learning without external services
  - Limited to pre-programmed responses
  - **Default provider** if none specified

- **Claude**: Anthropic's advanced language model (requires API key)
  - Default model: `claude-3-sonnet-20240229`
  - Sign up: [https://www.anthropic.com/claude](https://www.anthropic.com/claude)

- **Gemini**: Google's advanced language model (requires API key)
  - Default model: `gemini-pro`
  - Sign up: [https://ai.google.dev/](https://ai.google.dev/)

- **OpenAI**: OpenAI's language models (requires API key)
  - Default model: `gpt-3.5-turbo`
  - Sign up: [https://platform.openai.com/](https://platform.openai.com/)

### AI Implementation

NEOTERMINAL uses direct API integrations with AI providers through Axios:
- Each provider (Claude, Gemini) has a specific implementation that handles:
  - Authentication with API keys
  - Request formatting according to provider specifications
  - Response parsing to extract relevant information
  - Error handling and retry logic
- All API calls are made directly to the provider's endpoints with proper headers and parameters
- The system automatically selects the appropriate implementation based on your configuration

### AI Commands

- `ask <question>` - Ask the AI assistant for help with commands or concepts
- `hint` - Get contextual hints for your current mission objective

## //> COMMAND REFERENCE

### Navigation
- `pwd` - Print working directory
- `ls` - List directory contents
- `cd` - Change directory

### File Operations
- `cat` - Display file contents
- `mkdir` - Create directory
- `touch` - Create empty file
- `rm` - Remove files or directories

### Utility
- `help` - Display help information
- `clear` - Clear terminal screen
- `missions` - View and manage missions
- `ask` - Ask the AI assistant a question
- `hint` - Get a hint for the current mission objective

## //> MISSION SYSTEM

Missions are the heart of NEOTERMINAL. Each mission provides objectives that teach specific terminal commands in the context of the cyberpunk narrative.

Commands:
- `missions list` - List all available missions
- `missions info <id>` - Get detailed information about a mission
- `missions start <id>` - Start a mission
- `missions active` - List currently active missions

## //> PROJECT STRUCTURE

```
neoterminal/
├── src/
│   ├── ai/             # AI service integration
│   ├── core/           # Core system components
│   ├── terminal/       # Terminal emulation
│   ├── commands/       # Command definitions
│   ├── missions/       # Mission system
│   ├── narrative/      # Story content (Phase 2)
│   ├── skills/         # Skill tracking
│   ├── filesystem/     # Virtual filesystem
│   └── index.ts        # Application entry point
├── types/              # TypeScript type definitions
└── docs/               # Documentation
```

## //> DEVELOPMENT ROADMAP

**Phase 1**: Core System Implementation
- Terminal emulator with cyberpunk aesthetics
- Virtual filesystem
- Basic command set
- Initial mission framework

**Phase 2**: Adaptive Intelligence Integration *(Current)*
- AI-driven skill analysis
- Expanded command library
- Dynamic mission difficulty
- Enhanced visual feedback

**Phase 3**: Community & Extension
- Community mission submissions
- Multiplayer challenges
- Custom terminal themes
- Advanced narrative branching

## //> CONTRIBUTION

NEOTERMINAL is open to contributions! Check out the [CONTRIBUTING.md](docs/CONTRIBUTING.md) file for details on how to submit bug reports, feature requests, or code contributions.

## //> LICENSE

MIT © GHOST//SIGNAL COLLECTIVE

## Visual Experience

NEOTERMINAL provides a rich visual experience with cyberpunk-themed terminal styling:

- **Dynamic Text Formatting**: Narrative text is styled with context-aware coloring
- **Command Highlighting**: CLI commands, paths, and system terms are automatically highlighted
- **Character Dialogue**: Character names and dialogue are distinctly styled
- **Code Blocks**: Command examples and code snippets use syntax highlighting
- **ASCII Art**: Decorative elements use theme-appropriate colors
- **Error Messages**: Errors are clearly indicated with high-visibility styling

The system automatically applies the active terminal theme to all content, creating an immersive cyberpunk experience.

### Themes

NEOTERMINAL includes several built-in themes:

- **Neon Night**: Vibrant cyberpunk palette with bright neon colors on deep blue
- **Bladerunner**: Moody amber and teal palette inspired by the film
- **Ghost in the Shell**: Subtle jade and paper tones for a refined look
- **Synthwave**: Bold retro-futuristic colors with hot pink and cyan

You can customize or switch themes using the `theme` command.

// END OF TRANSMISSION
// DISCONNECT FROM UPLINK? [Y/N]