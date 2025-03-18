import { CommandCategory, Mission, SkillLevel } from "../../types";

/**
 * Initial tutorial missions
 */
export const initialMissions: Mission[] = [
  // Mission 1: System Calibration - Basic navigation
  {
    id: "mission_001",
    title: "System Calibration",
    description: "Learn to navigate the terminal interface",
    briefing:
      "Welcome, operative. Before we can assign you to field missions, we need to calibrate your neural interface with the NEOTERMINAL system. This mission will familiarize you with basic navigation commands.\n\n" +
      "Your objectives are to learn the basic navigation commands: pwd, ls, and cd. These will be essential for all future operations.",
    debriefing:
      "Well done. You've successfully calibrated your neural interface with the basic navigation commands. You're now ready for more advanced tasks.",
    asciiArt: `
   ____      _ _ _             _   _             
  / ___|__ _| (_) |__  _ __ __| | (_) ___  _ __  
 | |   / _\` | | | '_ \\| '__/ _\` | | |/ _ \\| '_ \\ 
 | |__| (_| | | | |_) | | | (_| | | | (_) | | | |
  \\____\\__,_|_|_|_.__/|_|  \\__,_| |_|\\___/|_| |_|
                                                 
`,
    difficulty: 1,
    estimatedTime: 10,
    objectives: [
      { type: "execute_command", command: "pwd", count: 1 },
      { type: "execute_command", command: "ls", count: 1 },
      {
        type: "execute_command",
        command: "cd",
        args: "/home/user/missions",
        count: 1,
      },
    ],
    environment: {
      filesystem: null, // To be set by the mission manager
      variables: {},
    },
    rewards: [
      {
        type: "skill_points",
        category: CommandCategory.NAVIGATION,
        points: 10,
      },
      { type: "story_progression", nodeId: "story_002" },
    ],
    requiredSkillLevel: SkillLevel.INITIATE,
    requiredCommands: [],
    nextMissions: ["mission_002"],
  },

  // Mission 2: Data Retrieval - Find and read files
  {
    id: "mission_002",
    title: "Data Retrieval",
    description: "Learn to find and read files",
    briefing:
      "Now that you can navigate the system, it's time to learn how to access data. In this mission, you'll learn to find and read files using the cat command.\n\n" +
      "Your mission is to read the contents of a security file located in one of our directories.",
    debriefing:
      "Excellent work. You've demonstrated the ability to locate and retrieve data. This skill will be crucial for infiltration missions.",
    asciiArt: `
  ____        _          ____      _        _                _ 
 |  _ \\  __ _| |_ __ _  |  _ \\ ___| |_ _ __(_) _____   ____ _| |
 | | | |/ _\` | __/ _\` | | |_) / _ \\ __| '__| |/ _ \\ \\ / / _\` | |
 | |_| | (_| | || (_| | |  _ <  __/ |_| |  | |  __/\\ V / (_| | |
 |____/ \\__,_|\\__\\__,_| |_| \\_\\___|\\__|_|  |_|\\___| \\_/ \\__,_|_|
                                                                
`,
    difficulty: 1,
    estimatedTime: 15,
    objectives: [
      {
        type: "execute_command",
        command: "cat",
        args: "/home/user/docs/security.txt",
        count: 1,
      },
    ],
    environment: {
      filesystem: null, // To be set by the mission manager
      variables: {},
    },
    rewards: [
      {
        type: "skill_points",
        category: CommandCategory.FILE_OPERATIONS,
        points: 10,
      },
      { type: "story_progression", nodeId: "story_003" },
    ],
    requiredSkillLevel: SkillLevel.INITIATE,
    requiredCommands: ["pwd", "ls", "cd"],
    nextMissions: ["mission_003"],
  },

  // Mission 3: Digital Footprints - Create and modify files
  {
    id: "mission_003",
    title: "Digital Footprints",
    description: "Learn to create and modify files",
    briefing:
      "Every hacker needs to know how to create and modify files in a target system. In this mission, you'll learn to create directories and files using mkdir and touch commands.\n\n" +
      "Your task is to create a personal workspace for your hacker operations.",
    debriefing:
      "Great job. You've now learned how to create your own files and directories, essential skills for any cyber operative.",
    asciiArt: `
  ____  _       _ _        _   _____         _            _       _       
 |  _ \\(_) __ _(_) |_ __ _| | |  ___|__  ___| |_ _ __  __(_)_ __ | |_ ___ 
 | | | |/ _\` | | __/ _\` | | | |_ / _ \\/ _ \\ __| '_ \\/ __| | '_ \\| __/ __|
 | |_| | | (_| | | || (_| | | |  _|  __/  __/ |_| |_) \\__ \\ | | | | |_\\__ \\
 |____/|_|\\__, |_|\\__\\__,_|_| |_|  \\___|\\___|\\__| .__/|___/_|_| |_|\\__|___/
          |___/                                 |_|                         
`,
    difficulty: 2,
    estimatedTime: 20,
    objectives: [
      {
        type: "execute_command",
        command: "mkdir",
        args: "/home/user/workspace",
        count: 1,
      },
      {
        type: "execute_command",
        command: "touch",
        args: "/home/user/workspace/notes.txt",
        count: 1,
      },
    ],
    environment: {
      filesystem: null, // To be set by the mission manager
      variables: {},
    },
    rewards: [
      {
        type: "skill_points",
        category: CommandCategory.FILE_OPERATIONS,
        points: 15,
      },
      { type: "story_progression", nodeId: "story_004" },
    ],
    requiredSkillLevel: SkillLevel.INITIATE,
    requiredCommands: ["cat", "ls", "cd"],
    nextMissions: ["mission_004"],
  },

  // Mission 4: Ghost Protocol - Practice removing traces
  {
    id: "mission_004",
    title: "Ghost Protocol",
    description: "Learn to remove files and hide your tracks",
    briefing:
      "A good hacker knows how to clean up after themselves. In this mission, you'll learn how to remove files and directories using the rm command.\n\n" +
      "Your assignment is to remove some test files without leaving a trace.",
    debriefing:
      "Mission accomplished. You now know how to erase your digital footprints - an essential skill for any covert operation.",
    asciiArt: `
   ____  _               _     ____            _                  _ 
  / ___|| |__   ___  ___| |_  |  _ \\ _ __ ___ | |_ ___   ___ ___ | |
 | |  _ | '_ \\ / _ \\/ __| __| | |_) | '__/ _ \\| __/ _ \\ / __/ _ \\| |
 | |_| || | | | (_) \\__ \\ |_  |  __/| | | (_) | || (_) | (_| (_) | |
  \\____|_| |_|\\___/|___/\\__| |_|   |_|  \\___/ \\__\\___/ \\___\\___/|_|
                                                                    
`,
    difficulty: 2,
    estimatedTime: 15,
    objectives: [
      {
        type: "execute_command",
        command: "rm",
        args: "/home/user/workspace/test_file.txt",
        count: 1,
      },
      {
        type: "execute_command",
        command: "rm",
        args: "-r /home/user/workspace/test_dir",
        count: 1,
      },
    ],
    environment: {
      filesystem: null, // To be set by the mission manager
      variables: {},
    },
    rewards: [
      {
        type: "skill_points",
        category: CommandCategory.FILE_OPERATIONS,
        points: 15,
      },
      { type: "story_progression", nodeId: "story_005" },
    ],
    requiredSkillLevel: SkillLevel.INITIATE,
    requiredCommands: ["mkdir", "touch", "ls", "cd"],
    nextMissions: ["mission_005"],
  },
];
