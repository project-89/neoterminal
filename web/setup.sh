#!/bin/bash
# Bootstrap script for NEOTERMINAL web interface

echo -e "\033[36m"
echo "███╗   ██╗███████╗ ██████╗ ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     "
echo "████╗  ██║██╔════╝██╔═══██╗╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     "
echo "██╔██╗ ██║█████╗  ██║   ██║   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     "
echo "██║╚██╗██║██╔══╝  ██║   ██║   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     "
echo "██║ ╚████║███████╗╚██████╔╝   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗"
echo "╚═╝  ╚═══╝╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝"
echo -e "\033[0m"

echo -e "\033[33mNEOTERMINAL Web Interface Setup\033[0m"
echo "=============================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "\033[31mError: npm is not installed.\033[0m"
    echo "Please install Node.js and npm first: https://nodejs.org/"
    exit 1
fi

# Navigate to the project root
cd ..

echo "Installing dependencies in project root..."
npm install xterm xterm-addon-fit xterm-addon-web-links

# Check installation status
if [ $? -eq 0 ]; then
    echo -e "\033[32mDependencies installed successfully.\033[0m"
else
    echo -e "\033[31mError: Failed to install dependencies.\033[0m"
    exit 1
fi

# Navigate back to web directory
cd web

echo ""
echo -e "\033[33mStarting server...\033[0m"
echo "You can access the NEOTERMINAL web interface at: http://localhost:8081/web/"
echo -e "\033[33mPress Ctrl+C to stop the server when you're done.\033[0m"
echo ""

# Make server script executable
chmod +x server.sh

# Start the server
./server.sh 