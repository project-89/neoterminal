import { AnimationType } from "./types";
import { BaseAnimation } from "./BaseAnimation";

/**
 * Matrix-style digital rain animation
 * Creates the iconic cascading green characters effect
 */
export class MatrixRainAnimation extends BaseAnimation {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 0;
  private height: number = 0;
  private drops: number[] = [];
  private fontSize: number = 14;
  private columns: number = 0;
  private matrixChars: string =
    "日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ01234567899876543210!@#$%^&*()_+-=[]{}|;:,./<>?";

  /**
   * Create a new matrix rain animation
   */
  constructor() {
    super(AnimationType.MATRIX_RAIN);
  }

  /**
   * Update the animation state based on progress
   * @param progress Animation progress (0-1)
   * @param iteration Current iteration count
   */
  protected update(progress: number, iteration: number): void {
    if (!this.canvas) {
      this.initialize();
    }

    // Skip if no canvas context
    if (!this.ctx || !this.canvas) {
      return;
    }

    // Semi-transparent black to create trail effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Green text
    this.ctx.fillStyle = "#00FF41";
    this.ctx.font = `${this.fontSize}px monospace`;

    // Loop through drops
    for (let i = 0; i < this.drops.length; i++) {
      // Get a random character
      const char =
        this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];

      // x coordinate of the drop (column * fontSize)
      const x = i * this.fontSize;

      // y coordinate of the drop (drops[i] * fontSize)
      const y = this.drops[i] * this.fontSize;

      // Draw the character
      this.ctx.fillText(char, x, y);

      // Randomly reset some drops to the top
      if (y > this.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }

      // Move drops down by one
      this.drops[i]++;
    }
  }

  /**
   * Initialize the canvas for the animation
   */
  private initialize(): void {
    // Create canvas element if container is provided or use existing canvas
    if (this.options.container instanceof HTMLCanvasElement) {
      this.canvas = this.options.container;
    } else if (this.options.container) {
      // Create new canvas inside container
      this.canvas = document.createElement("canvas");
      this.options.container.appendChild(this.canvas);
    } else {
      // No container, create canvas and add to body
      this.canvas = document.createElement("canvas");
      document.body.appendChild(this.canvas);
    }

    // Set canvas dimensions to fill container or use window size
    if (this.options.container) {
      this.width = this.options.container.clientWidth;
      this.height = this.options.container.clientHeight;
    } else {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Get 2D context
    this.ctx = this.canvas.getContext("2d");

    if (!this.ctx) {
      return;
    }

    // Set up the font size
    this.fontSize = 14;

    // Calculate columns based on canvas width
    this.columns = Math.floor(this.width / this.fontSize);

    // Initialize drops
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      // Initially set to random position
      this.drops[i] = Math.floor((Math.random() * this.height) / this.fontSize);
    }

    // Set black background
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Clean up after animation completes
   */
  protected complete(): void {
    // Remove canvas if we created it
    if (this.canvas && !this.options.container) {
      this.canvas.remove();
    }

    // Reset variables
    this.canvas = null;
    this.ctx = null;
    this.drops = [];

    // Call parent complete method
    super.complete();
  }
}
