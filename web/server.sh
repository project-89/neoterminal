#!/bin/bash
# Simple HTTP server to run the NEOTERMINAL web interface

# Navigate to the project root directory
cd ..

# Detect which server is available
if command -v python3 &> /dev/null; then
    echo "Starting server using Python 3..."
    python3 -m http.server 8081
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    if [[ $PYTHON_VERSION == *"Python 2"* ]]; then
        echo "Starting server using Python 2..."
        python -m SimpleHTTPServer 8081
    else
        echo "Starting server using Python 3..."
        python -m http.server 8081
    fi
elif command -v node &> /dev/null && npm list -g http-server &> /dev/null; then
    echo "Starting server using Node.js http-server..."
    http-server -p 8081
elif command -v php &> /dev/null; then
    echo "Starting server using PHP..."
    php -S localhost:8081
else
    echo "ERROR: Could not find a suitable server. Please install one of the following:"
    echo "  - Python 3"
    echo "  - Python 2"
    echo "  - Node.js with http-server"
    echo "  - PHP"
    exit 1
fi

echo "Server started on port 8081."
echo "Open http://localhost:8081/web/ in your browser to access NEOTERMINAL."
echo "Press Ctrl+C to stop the server." 