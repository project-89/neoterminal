/**
 * NEOTERMINAL Web Narrative Viewer
 * This file provides a simple narrative viewer interface that mimics
 * the functionality of the NEOTERMINAL narrative system.
 */

class WebNarrativeViewer {
    constructor() {
        this.narrativeContainer = document.querySelector('.narrative-container');
        this.currentChapter = 'chapter_001';
        this.currentNodeId = 'node_001_intro';
        this.narrativeNodes = {};
        this.charactersData = {};
        this.choicesHistory = [];
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load narrative data
        this.loadNarrativeData();
    }
    
    /**
     * Set up event listeners for narrative interactions
     */
    initEventListeners() {
        // Delegate click events for choices
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('choice-item')) {
                const choiceIndex = Array.from(
                    event.target.parentElement.children
                ).indexOf(event.target);
                
                this.makeChoice(choiceIndex);
            }
        });
    }
    
    /**
     * Load narrative data from JSON files
     */
    loadNarrativeData() {
        // In a real implementation, this would load from the server
        // For this demo, we'll use hardcoded narrative data
        
        // Sample narrative nodes for Chapter 1
        this.narrativeNodes = {
            'node_001_intro': {
                id: 'node_001_intro',
                title: 'An Unexpected Message',
                chapterId: 'chapter_001',
                content: `Your terminal blinks with an incoming message. Strange, you weren't expecting any communications on this secure channel.
        
"ATTENTION: CITIZEN #45601-B. YOUR DIGITAL FOOTPRINT HAS BEEN FLAGGED FOR REVIEW."

The message freezes your blood. A PANOPTICON notice - the ubiquitous surveillance system that monitors all digital activity. What did you do to trigger this?

Before you can process your thoughts, the message flickers and changes:

"DISREGARD PREVIOUS MESSAGE. SECURE CONNECTION ESTABLISHED. 

We've been watching you. Your skills are impressive. Not many can bypass a level-3 security node without triggering alarms. We have a proposition for you."`,
                choices: [
                    {
                        id: 'choice_001_a',
                        text: '"Who is this? How did you access my secure terminal?"',
                        nextNodeId: 'node_001_who'
                    },
                    {
                        id: 'choice_001_b',
                        text: '"I\'m listening. What kind of proposition?"',
                        nextNodeId: 'node_001_proposition'
                    },
                    {
                        id: 'choice_001_c',
                        text: 'Terminate the connection immediately',
                        nextNodeId: 'node_001_terminate'
                    }
                ]
            },
            'node_001_who': {
                id: 'node_001_who',
                title: 'A Digital Ghost',
                chapterId: 'chapter_001',
                speakerId: 'char_002',
                content: `"We are GHOST//SIGNAL. A collective dedicated to exposing the truth behind the PANOPTICON system."

The message continues, text appearing one line at a time.

"Your security measures are impressive, but we have resources that can bypass most systems when necessary. Don't worry - we only target those we're interested in recruiting."

There's a pause, as if the sender is considering what to say next.

"You should be more concerned about who's been tracking your activities before we intervened. The flag on your profile was real - we just intercepted it before it reached the authorities."`,
                choices: [
                    {
                        id: 'choice_002_a',
                        text: '"What do you mean my profile was flagged? What did I do?"',
                        nextNodeId: 'node_001_flagged'
                    },
                    {
                        id: 'choice_002_b',
                        text: '"Tell me about this proposition."',
                        nextNodeId: 'node_001_proposition'
                    },
                    {
                        id: 'choice_002_c',
                        text: 'Scan for traces of the connection source',
                        nextNodeId: 'node_001_scan'
                    }
                ]
            },
            'node_001_proposition': {
                id: 'node_001_proposition',
                title: 'The Offer',
                chapterId: 'chapter_001',
                speakerId: 'char_002',
                content: `"PANOPTICON isn't just monitoring communications - they're shaping reality. Controlling what people see, manipulating public opinion, erasing those who discover too much."

The text pauses momentarily.

"We need people with your skills. People who can move through systems undetected. Who can extract information and leave no trace."

Another pause.

"If you join us, we can protect you from the authorities who are already looking for you. More importantly, we can show you the truth about the world you live in."`,
                choices: [
                    {
                        id: 'choice_003_a',
                        text: '"What would I need to do exactly?"',
                        nextNodeId: 'node_001_details'
                    },
                    {
                        id: 'choice_003_b',
                        text: '"Why should I trust you?"',
                        nextNodeId: 'node_001_trust'
                    },
                    {
                        id: 'choice_003_c',
                        text: '"I'm not interested in becoming a criminal."',
                        nextNodeId: 'node_001_decline'
                    }
                ]
            },
            'node_001_terminate': {
                id: 'node_001_terminate',
                title: 'Severed Connection',
                chapterId: 'chapter_001',
                content: `You enter the command to terminate the connection. The message disappears from your screen, returning to your standard terminal interface.

For a moment, everything seems normal.

Then your screens flicker. All of them at once. 

A small message appears in the corner of your primary monitor:

"Think about our offer. We'll be in touch. Meanwhile, you might want to relocate. They're triangulating your position now."

Before you can react, all traces of the communication vanish. But a seed of doubt has been planted. 

Who are "they"? And how close are they to finding you?`,
                choices: [
                    {
                        id: 'choice_t_a',
                        text: 'Restart your system and run security diagnostics',
                        nextNodeId: 'node_001_diagnostics'
                    },
                    {
                        id: 'choice_t_b',
                        text: 'Pack essential equipment and prepare to move locations',
                        nextNodeId: 'node_001_relocate'
                    },
                    {
                        id: 'choice_t_c',
                        text: 'Try to re-establish contact with GHOST//SIGNAL',
                        nextNodeId: 'node_001_reconnect'
                    }
                ]
            }
            // Additional nodes would be defined here
        };
        
        // Character data
        this.charactersData = {
            'char_002': {
                id: 'char_002',
                name: 'ECHO',
                faction: 'GHOST//SIGNAL',
                role: 'Handler'
            }
        };
        
        // Display the initial node
        this.displayNode(this.currentNodeId);
    }
    
    /**
     * Display a narrative node
     */
    displayNode(nodeId) {
        const node = this.narrativeNodes[nodeId];
        if (!node) {
            console.error(`Node ${nodeId} not found`);
            return;
        }
        
        this.currentNodeId = nodeId;
        
        // Get chapter name
        const chapterName = node.chapterId === 'chapter_001' ? 'Chapter 1: The Awakening' : node.chapterId;
        
        // Build the HTML for the node
        let html = `
            <div class="narrative-info">
                <span class="chapter-title">${chapterName}</span>
                <span class="node-id">${node.id}</span>
            </div>
            
            <div class="narrative-title">${node.title}</div>
        `;
        
        // Add speaker if present
        if (node.speakerId && this.charactersData[node.speakerId]) {
            const speaker = this.charactersData[node.speakerId];
            html += `<div class="speaker-name">[${speaker.name}]:</div>`;
        }
        
        // Add content
        html += `<div class="narrative-content">${node.content}</div>`;
        
        // Add choices if present
        if (node.choices && node.choices.length > 0) {
            html += `<div class="choice-list">`;
            for (const choice of node.choices) {
                html += `<div class="choice-item">${choice.text}</div>`;
            }
            html += `</div>`;
        } else {
            html += `<div>End of narrative branch</div>`;
        }
        
        // Update the container
        this.narrativeContainer.innerHTML = html;
        
        // Add a subtle typing effect for immersion
        this.applyTypingEffect();
    }
    
    /**
     * Handle a player choice
     */
    makeChoice(choiceIndex) {
        const node = this.narrativeNodes[this.currentNodeId];
        if (!node || !node.choices || choiceIndex >= node.choices.length) {
            return;
        }
        
        const choice = node.choices[choiceIndex];
        this.choicesHistory.push({
            nodeId: this.currentNodeId,
            choiceId: choice.id,
            text: choice.text
        });
        
        // Go to the next node
        this.displayNode(choice.nextNodeId);
    }
    
    /**
     * Apply a subtle typing effect to the narrative content
     */
    applyTypingEffect() {
        const content = this.narrativeContainer.querySelector('.narrative-content');
        if (!content) return;
        
        const text = content.textContent;
        content.textContent = '';
        
        let charIndex = 0;
        const typeInterval = 1; // Typing speed - lower is faster
        
        const typeChar = () => {
            if (charIndex < text.length) {
                content.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, typeInterval);
            }
        };
        
        typeChar();
    }
}

// Initialize the viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new WebNarrativeViewer();
}); 