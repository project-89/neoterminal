/**
 * Base class for all filesystem entities (files, directories)
 */
export abstract class VirtualNode {
  name: string;
  parent: VirtualDirectory | null;
  permissions: FilePermissions;
  created: Date;
  modified: Date;
  accessed: Date;
  owner: string;
  group: string;
  
  constructor(name: string, parent: VirtualDirectory | null) {
    this.name = name;
    this.parent = parent;
    this.permissions = new FilePermissions(Permission.ALL, Permission.READ_EXEC, Permission.READ_EXEC);
    this.created = new Date();
    this.modified = new Date();
    this.accessed = new Date();
    this.owner = 'user';
    this.group = 'user';
  }
  
  abstract size(): number;
  abstract type(): string;
  abstract clone(): VirtualNode;
}

/**
 * Directory implementation
 */
export class VirtualDirectory extends VirtualNode {
  children: Map<string, VirtualNode>;
  
  constructor(name: string, parent: VirtualDirectory | null) {
    super(name, parent);
    this.children = new Map<string, VirtualNode>();
    // Directories default to have execute permissions
    this.permissions = new FilePermissions(
      Permission.ALL, 
      Permission.READ_EXEC, 
      Permission.READ_EXEC
    );
  }
  
  addChild(node: VirtualNode): void {
    this.children.set(node.name, node);
    this.modified = new Date();
  }
  
  removeChild(name: string): boolean {
    const result = this.children.delete(name);
    if (result) {
      this.modified = new Date();
    }
    return result;
  }
  
  getChild(name: string): VirtualNode | undefined {
    this.accessed = new Date();
    return this.children.get(name);
  }
  
  listChildren(): VirtualNode[] {
    this.accessed = new Date();
    return Array.from(this.children.values());
  }
  
  size(): number {
    return this.listChildren().reduce((total, child) => total + child.size(), 0);
  }
  
  type(): string {
    return 'directory';
  }
  
  clone(): VirtualDirectory {
    const clone = new VirtualDirectory(this.name, this.parent);
    clone.permissions = this.permissions.clone();
    clone.created = new Date(this.created);
    clone.modified = new Date(this.modified);
    clone.accessed = new Date(this.accessed);
    clone.owner = this.owner;
    clone.group = this.group;
    
    // Clone all children
    this.children.forEach((child, name) => {
      const childClone = child.clone();
      childClone.parent = clone;
      clone.children.set(name, childClone);
    });
    
    return clone;
  }
}

/**
 * File implementation
 */
export class VirtualFile extends VirtualNode {
  content: Buffer;
  
  constructor(name: string, parent: VirtualDirectory | null, content: Buffer = Buffer.from('')) {
    super(name, parent);
    this.content = content;
    // Files default to read/write but not execute
    this.permissions = new FilePermissions(
      Permission.READ_WRITE, 
      Permission.READ, 
      Permission.READ
    );
  }
  
  getContent(): Buffer {
    this.accessed = new Date();
    return this.content;
  }
  
  setContent(content: Buffer): void {
    this.content = content;
    this.modified = new Date();
  }
  
  appendContent(content: Buffer): void {
    this.content = Buffer.concat([this.content, content]);
    this.modified = new Date();
  }
  
  size(): number {
    return this.content.length;
  }
  
  type(): string {
    return 'file';
  }
  
  clone(): VirtualFile {
    const clone = new VirtualFile(this.name, this.parent, Buffer.from(this.content));
    clone.permissions = this.permissions.clone();
    clone.created = new Date(this.created);
    clone.modified = new Date(this.modified);
    clone.accessed = new Date(this.accessed);
    clone.owner = this.owner;
    clone.group = this.group;
    return clone;
  }
}

/**
 * File permissions (similar to Unix permissions)
 */
export class FilePermissions {
  user: Permission;
  group: Permission;
  other: Permission;
  
  constructor(user: Permission, group: Permission, other: Permission) {
    this.user = user;
    this.group = group;
    this.other = other;
  }
  
  toString(): string {
    return this.permissionToString(this.user) + 
           this.permissionToString(this.group) + 
           this.permissionToString(this.other);
  }
  
  private permissionToString(perm: Permission): string {
    let result = '';
    result += (perm & Permission.READ) ? 'r' : '-';
    result += (perm & Permission.WRITE) ? 'w' : '-';
    result += (perm & Permission.EXECUTE) ? 'x' : '-';
    return result;
  }
  
  fromString(permStr: string): void {
    if (permStr.length !== 9) {
      throw new Error('Invalid permission string');
    }
    
    this.user = this.stringToPermission(permStr.substring(0, 3));
    this.group = this.stringToPermission(permStr.substring(3, 6));
    this.other = this.stringToPermission(permStr.substring(6, 9));
  }
  
  private stringToPermission(perm: string): Permission {
    let result = Permission.NONE;
    if (perm.charAt(0) === 'r') result |= Permission.READ;
    if (perm.charAt(1) === 'w') result |= Permission.WRITE;
    if (perm.charAt(2) === 'x') result |= Permission.EXECUTE;
    return result;
  }
  
  clone(): FilePermissions {
    return new FilePermissions(this.user, this.group, this.other);
  }
}

/**
 * Permission enumeration (similar to Unix permissions)
 */
export enum Permission {
  NONE = 0,      // ---
  EXECUTE = 1,   // --x
  WRITE = 2,     // -w-
  WRITE_EXEC = 3, // -wx
  READ = 4,      // r--
  READ_EXEC = 5, // r-x
  READ_WRITE = 6, // rw-
  ALL = 7        // rwx
} 