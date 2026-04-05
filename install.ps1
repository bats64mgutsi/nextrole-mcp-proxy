# NextRole MCP Proxy Installation Script

$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing NextRole MCP Proxy..."

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18.0.0 or higher."
    Write-Host "Visit: https://nodejs.org/"
    exit 1
}

# Check Node.js version
$NODE_VERSION = (node -v) -replace '^v', ''
$REQUIRED_VERSION = "18.0.0"

if ([version]$NODE_VERSION -lt [version]$REQUIRED_VERSION) {
    Write-Host "⚠️  Node.js version mismatch: installed=$NODE_VERSION, required=$REQUIRED_VERSION"
}

Write-Host "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
Write-Host "📦 Installing dependencies..."
npm install

# Build the project
Write-Host "🔨 Building project..."
npm run build

Write-Host "✅ Installation complete!"
Write-Host ""
Write-Host "🎉 NextRole MCP Proxy is ready to use!"
Write-Host ""
Write-Host "To start the server:"
Write-Host "  npm start"
Write-Host ""
Write-Host 'To use with MCP clients, add this to your configuration:'
Write-Host '  {'
Write-Host '    "mcpServers": {'
Write-Host '      "nextrole": {'
Write-Host '        "command": "node",'
Write-Host "        `"args`": [`"$PWD\dist\index.js`"]"
Write-Host '      }'
Write-Host '    }'
Write-Host '  }'
Write-Host ''
Write-Host '📚 Read the README.md for detailed usage instructions'
Write-Host '🔗 Privacy Policy: https://api.nextrole.co.za/firstroleprod-mcp/docs/privacy-policy'
Write-Host '🔗 Terms of Service: https://api.nextrole.co.za/firstroleprod-mcp/docs/terms-of-service'
