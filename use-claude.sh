#!/bin/bash

# Helper script to run NEOTERMINAL with Anthropic Claude

# Check if API key is provided
if [ -z "$1" ]; then
  echo "Error: API key is required"
  echo "Usage: $0 YOUR_CLAUDE_API_KEY"
  exit 1
fi

# Run with Claude configuration
API_PROVIDER=claude API_API_KEY=$1 npm start 