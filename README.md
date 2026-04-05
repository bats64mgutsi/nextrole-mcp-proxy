# NextRole MCP Proxy

A Model Context Protocol (MCP) proxy server that provides access to NextRole's professional CV and cover letter tailoring services. This proxy allows MCP-compatible clients to interact with NextRole's hosted services.

## Features

- **Professional CV Tailoring**: Customize your CV for specific job applications
- **Cover Letter Generation**: Create tailored cover letters that match job requirements  
- **Multiple Service Tiers**: Entry, Mid, and Senior level professional services
- **Credit Management**: Track and manage your service credits
- **International Support**: Available for users worldwide

## Installation

### From source

Clone the repository and run the install script. It will install dependencies, build the project, and print the MCP client configuration JSON for you.

```bash
git clone https://github.com/bats64mgutsi/nextrole-mcp-proxy.git
cd nextrole-mcp-proxy
```

**Linux / macOS:**
```bash
bash install.sh
```

**Windows (PowerShell):**
```powershell
.\install.ps1
```

At the end of the script, you'll see the MCP client configuration JSON with the correct path to your local installation. Copy it into your MCP client's configuration file.

### With npx (no local install)

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "nextrole": {
      "command": "npx",
      "args": ["nextrole-mcp-proxy"]
    }
  }
}
```

## Usage

### Available Tools

#### 1. get_pricing
Get the available career-level tiers and their product IDs. You must call this before placing an order to get the correct `productId`.

**Usage:**
```
What are your different CV tailoring packages?
```

**Response:**
```json
[
  {
    "CountryCode": "ZA", 
    "ServiceTier": "Entry Level",
    "ProductId": 1
  },
  {
    "CountryCode": "ZA",
    "ServiceTier": "Mid Level", 
    "ProductId": 2
  },
  {
    "CountryCode": "ZA",
    "ServiceTier": "Senior Level",
    "ProductId": 3
  }
]
```

#### 2. get_credits
Check how many credits a customer has remaining. Each order costs 1 credit.

**Parameters:**
- `phoneNumber` (required): Customer phone number including country code (e.g. +27831234567)

**Usage:**
```
How many credits do I have left? My phone number is +27831234567
```

**Response:**
```json
{
  "credits": 5
}
```

#### 3. place_order
Place an order for a tailored CV and cover letter. The order typically takes about 15 minutes to complete. The customer will receive SMS notifications when the order is confirmed and when documents are ready. Costs 1 credit per order.

**Parameters:**
- `customerPhone` (required): Customer phone number including country code, must start with '+' (e.g. +27831234567)
- `customerFirstName` (required): Customer's first name
- `customerLastName` (required): Customer's last name
- `cvMarkdown` (required): The customer's current CV in markdown format
- `productId` (required): The product ID matching the customer's career level (call get_pricing first)
- `jobDescription` (required): The full job description the customer is applying for

**Usage:**
```
I need to tailor my CV for a Junior Software Developer position. My phone number is +27831234567, my name is John Smith, and here's my current CV in markdown:

# John Smith
## Experience
- Junior Developer at TechCorp (2023-present)

The job description is: We are seeking a Junior Software Developer to join our team with React and Node.js experience.
```

**Response:**
```json
{
  "orderKey": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "message": "Order placed successfully. SMS notifications sent."
}
```

## Example Use Cases

### Entry Level Professional
Perfect for recent graduates and early-career professionals:

```
I'm Sarah Johnson (+44207123456) and need my CV tailored for this graduate software engineer role: Graduate Software Engineer requiring Python programming and problem-solving skills. 

My current CV:
# Sarah Johnson
## Education
- Computer Science Degree, University of London (2024)
## Projects  
- Built a web application using Python and Flask
```

### Career Change
For professionals transitioning between industries:

```
I'm transitioning from finance to tech and need my CV (+27831112233, Jane Doe) tailored for this software developer role: Full Stack Developer position requiring JavaScript, React, and database skills.

Current CV:
# Jane Doe
## Background
- Financial Analyst at Bank Corp
- Recently completed coding bootcamp
```

### Senior Executive
For C-level and senior management positions:

```
I'm Michael Chen from the US (+1555123456) and need my executive CV customized for this CTO role: Chief Technology Officer requiring strategic leadership and team management skills.

My current CV:
# Michael Chen
## Executive Summary
Senior Technology Leader with 15+ years experience
## Experience
- VP Engineering at Tech Startup (2020-2024)
```

## Service Tiers

- **Entry Level (Product ID: 1)**: For recent graduates and early-career professionals
- **Mid Level (Product ID: 2)**: For experienced professionals with 3-10 years experience  
- **Senior Level (Product ID: 3)**: For senior professionals, managers, and executives

## Privacy & Terms

By using this service, you agree to NextRole's:
- [Privacy Policy](https://api.nextrole.co.za/firstroleprod-mcp/docs/privacy-policy)
- [Terms of Service](https://api.nextrole.co.za/firstroleprod-mcp/docs/terms-of-service)

## Development

### Building
```bash
npm run build
```

### Running in development
```bash
npm run dev
```

### Testing locally
```bash
npm start
```

## Architecture

This is a lightweight proxy that forwards MCP requests to NextRole's hosted service at `https://api.nextrole.co.za/firstroleprod-mcp/mcp`. The proxy:

- Translates MCP protocol requests
- Forwards them to the hosted service
- Returns formatted responses to MCP clients
- Handles errors and connection issues

## Requirements

- Node.js 18.0.0 or higher
- Internet connection to reach NextRole's hosted service

## License

MIT License - see LICENSE file for details.

## Support

For technical issues with this proxy, please open an issue on GitHub.
For service-related questions, contact NextRole support through their official channels.