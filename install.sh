#!/bin/bash

# NextRole MCP Proxy Installation Script

set -e

echo "🚀 Installing NextRole MCP Proxy..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.0.0 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "⚠️  Node.js version mismatch: installed=$NODE_VERSION, required=$REQUIRED_VERSION"
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Installation complete!"
echo ""
echo "🎉 NextRole MCP Proxy is ready to use!"
echo ""
echo "To start the server:"
echo "  npm start"
echo ""
echo "To use with MCP clients, add this to your configuration:"
echo '  {'
echo '    "mcpServers": {'
echo '      "nextrole": {'
echo '        "command": "node",'
echo '        "args": ["'$(pwd)'/dist/index.js"]'
echo '      }'
echo '    }'
echo '  }'
echo ""
echo "📚 Read the README.md for detailed usage instructions"
echo "🔗 Privacy Policy: https://api.nextrole.co.za/firstroleprod-mcp/docs/privacy-policy"
echo "🔗 Terms of Service: https://api.nextrole.co.za/firstroleprod-mcp/docs/terms-of-service"