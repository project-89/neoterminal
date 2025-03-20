/**
 * Advanced terminal animation implementations for NEOTERMINAL
 */

class TerminalAnimations {
  constructor(terminal) {
    this.terminal = terminal;
    this.isAnimating = false;
    this.activeAnimations = new Set();
    this.currentAnimationType = null;
  }

  /**
   * Apply a real-time glitch effect to ASCII art
   * @param {string} art The ASCII art to glitch
   * @param {number} duration Duration in milliseconds
   * @param {number} intensity Glitch intensity (0-1)
   */
  applyGlitchEffect(art, duration = 3000, intensity = 0.3) {
    // If another animation is running, stop it first
    this.stopAllAnimations();

    this.isAnimating = true;
    this.currentAnimationType = "glitch";
    this._updateButtonStates();

    const lines = art.split("\n");
    const glitchChars = "!<>-_\\/[]{}—=+*^?#$%&@";
    const originalArt = art;

    // Display original first
    this.terminal.writeln(
      "\r\n\x1b[36mAnimated Glitch Effect Starting...\x1b[0m\r\n"
    );
    this.terminal.writeln("\x1b[33mOriginal:\x1b[0m");
    this.terminal.writeln("\x1b[36m" + art + "\x1b[0m\r\n");

    const startTime = Date.now();
    const animationId = setInterval(() => {
      // Apply glitch effect
      if (Math.random() < intensity) {
        let glitched = "";

        for (let line of lines) {
          let glitchedLine = "";
          for (let i = 0; i < line.length; i++) {
            if (line[i] !== " " && Math.random() < intensity) {
              glitchedLine +=
                glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
              glitchedLine += line[i];
            }
          }
          glitched += glitchedLine + "\n";
        }

        // Clear previous output and write glitched version
        this.terminal.write("\x1b[33m\r\nGlitched:\x1b[0m\r\n");
        this.terminal.write("\x1b[31m" + glitched + "\x1b[0m");

        // Reset after a short time
        setTimeout(() => {
          if (this.activeAnimations.has(animationId)) {
            this.terminal.write("\x1b[33m\r\nGlitched:\x1b[0m\r\n");
            this.terminal.write("\x1b[36m" + originalArt + "\x1b[0m");
          }
        }, 100);
      }

      // Check if animation should end
      if (Date.now() - startTime > duration) {
        clearInterval(animationId);
        this.activeAnimations.delete(animationId);
        if (this.activeAnimations.size === 0) {
          this._finishAnimation();
        }
      }
    }, 200);

    this.activeAnimations.add(animationId);
  }

  /**
   * Apply a real-time Matrix rain effect
   * @param {number} duration Duration in milliseconds
   */
  applyMatrixRain(duration = 5000) {
    // If another animation is running, stop it first
    this.stopAllAnimations();

    this.isAnimating = true;
    this.currentAnimationType = "matrix";
    this._updateButtonStates();

    this.terminal.writeln(
      "\r\n\x1b[36mMatrix Rain Animation Starting...\x1b[0m\r\n"
    );

    const cols = Math.floor(this.terminal.cols / 2);
    const rows = 15;
    let matrix = [];

    // Initialize matrix with spaces
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        row.push(" ");
      }
      matrix.push(row);
    }

    // Create "rain drops" at random positions
    const drops = [];
    for (let i = 0; i < cols / 3; i++) {
      drops.push({
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows) - rows,
        speed: 0.1 + Math.random() * 0.5,
        length: 3 + Math.floor(Math.random() * 10),
      });
    }

    const startTime = Date.now();
    const animationId = setInterval(() => {
      // Clear matrix
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          matrix[i][j] = " ";
        }
      }

      // Update drop positions
      for (let drop of drops) {
        drop.y += drop.speed;

        // Draw the drop and its trail
        for (let i = 0; i < drop.length; i++) {
          const y = Math.floor(drop.y) - i;
          if (y >= 0 && y < rows) {
            // Choose character
            const symbols = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃ";
            let char = symbols[Math.floor(Math.random() * symbols.length)];

            // Head of the drop is brighter
            matrix[y][drop.x] =
              i === 0 ? `\x1b[1;32m${char}\x1b[0m` : `\x1b[32m${char}\x1b[0m`;
          }
        }

        // Reset drop if it's off screen
        if (drop.y - drop.length > rows) {
          drop.y = -drop.length;
          drop.x = Math.floor(Math.random() * cols);
        }
      }

      // Render matrix
      this.terminal.write("\x1b[H"); // Move cursor to top
      let output = "";
      for (let i = 0; i < rows; i++) {
        let line = "";
        for (let j = 0; j < cols; j++) {
          line += matrix[i][j] + " ";
        }
        output += line + "\r\n";
      }
      this.terminal.write(output);

      // Check if animation should end
      if (Date.now() - startTime > duration) {
        clearInterval(animationId);
        this.activeAnimations.delete(animationId);
        if (this.activeAnimations.size === 0) {
          this._finishAnimation();
        }
      }
    }, 100);

    this.activeAnimations.add(animationId);
  }

  /**
   * Apply a real-time typing effect
   * @param {string} text Text to animate
   * @param {number} duration Duration in milliseconds
   */
  applyTypingEffect(text, duration = 2000) {
    // If another animation is running, stop it first
    this.stopAllAnimations();

    this.isAnimating = true;
    this.currentAnimationType = "typing";
    this._updateButtonStates();

    this.terminal.writeln(
      "\r\n\x1b[36mTyping Animation Starting...\x1b[0m\r\n"
    );

    let index = 0;
    const charDelay = duration / text.length;

    this.terminal.write("\x1b[33m");

    const animationId = setInterval(() => {
      if (index < text.length) {
        this.terminal.write(text[index]);
        index++;
      } else {
        clearInterval(animationId);
        this.activeAnimations.delete(animationId);
        if (this.activeAnimations.size === 0) {
          this._finishAnimation();
        }
      }
    }, charDelay);

    this.activeAnimations.add(animationId);
  }

  /**
   * Apply a real-time pulse effect to ASCII art
   * @param {string} art The ASCII art to pulse
   * @param {number} duration Duration in milliseconds
   */
  applyPulseEffect(art, duration = 3000) {
    // If another animation is running, stop it first
    this.stopAllAnimations();

    this.isAnimating = true;
    this.currentAnimationType = "pulse";
    this._updateButtonStates();

    this.terminal.writeln("\r\n\x1b[36mPulse Animation Starting...\x1b[0m\r\n");
    this.terminal.writeln("\x1b[33mPulsing ASCII Art:\x1b[0m\r\n");

    const pulseColors = [
      "\x1b[36m", // Cyan
      "\x1b[34m", // Blue
      "\x1b[35m", // Magenta
      "\x1b[34m", // Blue
      "\x1b[36m", // Cyan
    ];

    let colorIndex = 0;
    const startTime = Date.now();

    const animationId = setInterval(() => {
      colorIndex = (colorIndex + 1) % pulseColors.length;
      this.terminal.write("\x1b[1A".repeat(art.split("\n").length + 1)); // Move cursor up
      this.terminal.writeln("\x1b[33mPulsing ASCII Art:\x1b[0m\r\n");
      this.terminal.write(pulseColors[colorIndex] + art + "\x1b[0m\r\n");

      // Check if animation should end
      if (Date.now() - startTime > duration) {
        clearInterval(animationId);
        this.activeAnimations.delete(animationId);
        if (this.activeAnimations.size === 0) {
          this._finishAnimation();
        }
      }
    }, 150);

    this.activeAnimations.add(animationId);
  }

  /**
   * Stop all animations
   */
  stopAllAnimations() {
    for (const id of this.activeAnimations) {
      clearInterval(id);
    }
    this.activeAnimations.clear();

    if (this.isAnimating) {
      this._finishAnimation();
    }
  }

  /**
   * Helper method to finish animation and reset states
   * @private
   */
  _finishAnimation() {
    this.isAnimating = false;
    this.currentAnimationType = null;
    this.terminal.writeln("\r\n\x1b[36mAnimation complete.\x1b[0m\r\n");
    this.terminal.write("> ");
    this._updateButtonStates();
  }

  /**
   * Helper method to update button states based on current animation
   * @private
   */
  _updateButtonStates() {
    // Get all animation buttons
    const animationButtons = [
      document.getElementById("animateGlitch"),
      document.getElementById("animateMatrix"),
      document.getElementById("animateTyping"),
      document.getElementById("animatePulse"),
      document.getElementById("testAscii"),
    ];

    // Reset all buttons
    animationButtons.forEach((button) => {
      if (button) {
        button.classList.remove("active");
        button.disabled = false;
      }
    });

    // If we're animating, highlight the active animation button
    if (this.isAnimating && this.currentAnimationType) {
      const buttonMap = {
        glitch: "animateGlitch",
        matrix: "animateMatrix",
        typing: "animateTyping",
        pulse: "animatePulse",
      };

      const activeButtonId = buttonMap[this.currentAnimationType];
      if (activeButtonId) {
        const activeButton = document.getElementById(activeButtonId);
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }
    }
  }
}
