# NEOTERMINAL Web Interface

This web interface provides a browser-based implementation of the NEOTERMINAL application. It offers two modes:

1. **Full Terminal Mode**: A complete implementation of the NEOTERMINAL experience in the browser
2. **Animation Demo Mode**: A simplified interface to test just the ASCII art animations

## Setup Instructions

### Quick Start

The easiest way to get started is to use the provided setup script:

```bash
# Install dependencies
npm run install-deps

# Start the server
npm start
```

Then open your browser and navigate to `http://localhost:8080/web/`

### Manual Setup

If you prefer to set up manually:

1. Make sure you have all the necessary npm packages installed:
   ```
   npm install xterm xterm-addon-fit xterm-addon-web-links
   ```

2. You'll need a simple HTTP server to serve the files. You can use any of these options:

   **Option 1: Use Node.js http-server:**
   ```
   npm install -g http-server
   http-server -p 8080
   ```

   **Option 2: Use Python's built-in server:**
   ```
   # Python 3
   python -m http.server 8080
   
   # Python 2
   python -m SimpleHTTPServer 8080
   ```

   **Option 3: Use PHP's built-in server:**
   ```
   php -S localhost:8080
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080/web/
   ```

## Full Terminal Mode

The full terminal mode provides a complete NEOTERMINAL experience with:

### Available Commands

- **Navigation Commands**:
  - `cd <directory>` - Change directory
  - `ls [path]` - List directory contents
  - `pwd` - Print working directory

- **File Operations**:
  - `cat <file>` - Display file contents
  - `mkdir <directory>` - Create directory
  - `touch <file>` - Create empty file

- **Special Features**:
  - `ascii <art_name> [--option]` - Display ASCII art
    - Options: `--glitch`, `--rainbow`, `--pulse`
  - `animation <type>` - Play animation
    - Types: `glitch`, `matrix`, `typing`, `pulse`

- **Utility Commands**:
  - `clear` - Clear terminal
  - `help` - Display help

### File System

The application includes a virtual file system that allows you to navigate directories, create files and folders, and read file contents - all persisted in the browser's memory.

### Command History

Use the up and down arrow keys to navigate through your command history.

## Animation Demo Mode

If you want to focus just on testing the ASCII art animations, you can switch to the Animation Demo mode, which provides buttons to trigger various effects:

1. **Test ASCII Art**: Displays different examples of static ASCII art
2. **Animate Glitch Effect**: Shows a glitching animation effect on ASCII art
3. **Animate Matrix Rain**: Displays a "Matrix-style" digital rain animation
4. **Animate Typing Effect**: Shows a typing animation with cyberpunk-themed text
5. **Animate Pulse Effect**: Makes ASCII art pulse with changing colors
6. **Stop Animations**: Immediately stops all running animations
7. **Clear Terminal**: Clears the terminal display

## New Features

Recent additions to the web interface include:

- **Separated CSS**: The styling has been moved to a separate CSS file for better maintainability
- **Loading Animation**: A visual indicator when the terminal is initializing
- **Status Bar**: Shows connection status and current time
- **Responsive Design**: The interface adapts to different screen sizes
- **Dynamic Connection Status**: Simulates occasional connection drops for visual interest

## Implementation Details

- The terminal is powered by [xterm.js](https://xtermjs.org/), a terminal emulator for the web
- Animations are implemented using JavaScript's `setInterval` and `setTimeout` functions
- The virtual file system is implemented entirely in JavaScript memory
- Command processing follows a similar architecture to the main NEOTERMINAL application
- Colors are applied using ANSI escape sequences (`\x1b[XXm`), which xterm.js interprets correctly

## Project Structure

- `index.html` - Main HTML file for the web interface
- `styles.css` - CSS styling for the interface
- `animations.js` - Terminal animation implementations
- `app.js` - Core terminal functionality and command processing
- `server.sh` - Shell script to start a local server
- `package.json` - Dependencies and scripts for the web interface

## Future Enhancements

Possible enhancements for future versions:

1. Persistence of the file system using localStorage
2. Implementation of more commands (grep, ps, etc.)
3. Tab completion for commands and file paths
4. More advanced terminal features (copy/paste, selection)
5. Multi-user collaboration mode
6. Full screen mode for immersive experience

---

Feel free to explore both modes and experience the full NEOTERMINAL interface in your browser! If you encounter any issues or have suggestions for improvements, please submit them to the GHOST//SIGNAL collective. 