import EventEmitter from "events";
import { VirtualNode, VirtualDirectory, VirtualFile } from "./VirtualNodes";

export class VirtualFileSystem extends EventEmitter {
  private root: VirtualDirectory;
  private currentDirectory: VirtualDirectory;

  constructor() {
    super();
    this.root = new VirtualDirectory("/", null);
    this.currentDirectory = this.root;

    // Initialize basic filesystem structure
    this.initializeFileSystem();
  }

  private initializeFileSystem(): void {
    // Create basic directory structure
    const home = this.mkdir("/home");
    const user = this.mkdir("/home/user");
    this.mkdir("/home/user/missions");
    this.mkdir("/home/user/docs");
    this.mkdir("/home/user/tools");
    this.mkdir("/sys");
    this.mkdir("/net");
    this.mkdir("/data");

    // Set initial current directory to user's home
    this.currentDirectory = user as VirtualDirectory;

    // Create some initial files
    this.writeFile(
      "/home/user/README.txt",
      "WELCOME TO NEOTERMINAL\n\n" +
        "You have been recruited by GHOST//SIGNAL, a hacktivist collective\n" +
        "fighting against corporate control of cyberspace.\n\n" +
        'Type "help" for a list of available commands.\n' +
        'Type "missions" to view your current objectives.\n'
    );
  }

  public getCurrentDirectory(): VirtualDirectory {
    return this.currentDirectory;
  }

  public setCurrentDirectory(directory: VirtualDirectory): void {
    this.currentDirectory = directory;
    this.emit("directory-changed", { path: this.getCurrentPath() });
  }

  public getCurrentPath(): string {
    const parts: string[] = [];
    let dir: VirtualDirectory | null = this.currentDirectory;

    while (dir !== null) {
      parts.unshift(dir.name);
      dir = dir.parent;
    }

    return parts.join("/").replace("//", "/") || "/";
  }

  public resolvePath(path: string): string {
    // Convert path to absolute
    let absolutePath: string;

    if (path.startsWith("/")) {
      absolutePath = path;
    } else {
      absolutePath = `${this.getCurrentPath()}/${path}`;
    }

    // Normalize path
    const parts = absolutePath.split("/").filter(Boolean);
    const result: string[] = [];

    for (const part of parts) {
      if (part === ".") {
        continue;
      } else if (part === "..") {
        result.pop();
      } else {
        result.push(part);
      }
    }

    return `/${result.join("/")}`;
  }

  public getNode(path: string): VirtualNode | null {
    const resolvedPath = this.resolvePath(path);

    // Root directory special case
    if (resolvedPath === "/") {
      return this.root;
    }

    const parts = resolvedPath.split("/").filter(Boolean);

    let current: VirtualNode = this.root;

    for (const part of parts) {
      if (!(current instanceof VirtualDirectory)) {
        return null;
      }

      const child = current.getChild(part);

      if (!child) {
        return null;
      }

      current = child;
    }

    return current;
  }

  public mkdir(path: string): VirtualNode {
    const resolvedPath = this.resolvePath(path);

    // Check if directory already exists
    const existingNode = this.getNode(resolvedPath);
    if (existingNode) {
      if (existingNode instanceof VirtualDirectory) {
        return existingNode;
      } else {
        throw new Error(`Path exists but is not a directory: ${path}`);
      }
    }

    // Create parent directories if needed
    const parentPath = resolvedPath.split("/").slice(0, -1).join("/") || "/";
    const directoryName = resolvedPath.split("/").pop() || "";

    if (!directoryName) {
      throw new Error("Invalid directory name");
    }

    let parent = this.getNode(parentPath);

    // Create parent directories if they don't exist
    if (!parent) {
      parent = this.mkdir(parentPath);
    }

    if (!(parent instanceof VirtualDirectory)) {
      throw new Error(`Parent path is not a directory: ${parentPath}`);
    }

    // Create directory
    const directory = new VirtualDirectory(directoryName, parent);
    parent.addChild(directory);

    this.emit("node-created", { path: resolvedPath, node: directory });

    return directory;
  }

  public writeFile(path: string, content: string): VirtualNode {
    const resolvedPath = this.resolvePath(path);
    const parentPath = resolvedPath.split("/").slice(0, -1).join("/") || "/";
    const fileName = resolvedPath.split("/").pop() || "";

    if (!fileName) {
      throw new Error("Invalid file name");
    }

    // Get parent directory, create if doesn't exist
    let parent = this.getNode(parentPath);
    if (!parent) {
      parent = this.mkdir(parentPath);
    }

    if (!(parent instanceof VirtualDirectory)) {
      throw new Error(`Parent path is not a directory: ${parentPath}`);
    }

    // Check if file exists
    let file = parent.getChild(fileName);

    if (file && !(file instanceof VirtualFile)) {
      throw new Error(`Path exists but is not a file: ${path}`);
    }

    if (!file) {
      // Create new file
      file = new VirtualFile(fileName, parent);
      parent.addChild(file);
      this.emit("node-created", { path: resolvedPath, node: file });
    }

    // Update file content
    (file as VirtualFile).setContent(Buffer.from(content));
    this.emit("node-modified", { path: resolvedPath, node: file });

    return file;
  }

  public readFile(path: string): Buffer {
    const node = this.getNode(path);

    if (!node) {
      throw new Error(`File not found: ${path}`);
    }

    if (!(node instanceof VirtualFile)) {
      throw new Error(`Path is not a file: ${path}`);
    }

    node.accessed = new Date();
    this.emit("node-accessed", { path, node });

    return node.getContent();
  }

  public deleteNode(path: string): void {
    const resolvedPath = this.resolvePath(path);

    // Cannot delete root
    if (resolvedPath === "/") {
      throw new Error("Cannot delete root directory");
    }

    const parentPath = resolvedPath.split("/").slice(0, -1).join("/") || "/";
    const nodeName = resolvedPath.split("/").pop() || "";

    // Get parent directory
    const parent = this.getNode(parentPath);

    if (!parent || !(parent instanceof VirtualDirectory)) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    // Check if node exists
    const node = parent.getChild(nodeName);

    if (!node) {
      throw new Error(`Node not found: ${path}`);
    }

    // Delete node
    parent.removeChild(nodeName);
    this.emit("node-deleted", { path: resolvedPath });
  }

  public listDirectory(path: string): VirtualNode[] {
    const node = this.getNode(path);

    if (!node) {
      throw new Error(`Directory not found: ${path}`);
    }

    if (!(node instanceof VirtualDirectory)) {
      throw new Error(`Path is not a directory: ${path}`);
    }

    return node.listChildren();
  }

  public changeDirectory(path: string): void {
    const node = this.getNode(path);

    if (!node) {
      throw new Error(`Directory not found: ${path}`);
    }

    if (!(node instanceof VirtualDirectory)) {
      throw new Error(`Path is not a directory: ${path}`);
    }

    this.setCurrentDirectory(node);
  }
}
