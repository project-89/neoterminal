#!/bin/bash

# Helper script to run NEOTERMINAL with Google Gemini

# Check if API key is provided
if [ -z "$1" ]; then
  echo "Error: API key is required"
  echo "Usage: $0 YOUR_GEMINI_API_KEY"
  exit 1
fi

# Run with Gemini configuration
API_PROVIDER=gemini API_API_KEY=$1 npm start 