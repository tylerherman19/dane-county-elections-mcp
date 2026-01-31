# Dane County Elections MCP Server

A Model Context Protocol (MCP) server that provides access to the Dane County Elections API. This server allows AI assistants to query election data, results, and precinct information from Dane County, Wisconsin.

## Features

- **List Elections**: Get all available elections
- **Election Details**: Retrieve information about specific elections
- **Race Information**: Access race details for elections
- **Election Results**: Query results at election and race levels
- **Precinct Results**: Get detailed precinct-level voting data
- **Type-Safe**: Built with TypeScript for robust type checking
- **Error Handling**: Comprehensive error handling for API failures
- **MCP Compatible**: Works with Claude Desktop and other MCP clients

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Install from Source

```bash
# Clone the repository
git clone https://github.com/tylerherman19/dane-county-elections-mcp.git
cd dane-county-elections-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Install as Package (optional)

```bash
npm install -g .
```

## Configuration

### Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dane-county-elections": {
      "command": "node",
      "args": ["/absolute/path/to/dane-county-elections-mcp/dist/index.js"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "dane-county-elections": {
      "command": "dane-county-elections-mcp"
    }
  }
}
```

### Other MCP Clients

The server uses stdio transport and can be integrated with any MCP-compatible client by running:

```bash
node dist/index.js
```

## Available Tools

### 1. list_elections

Get a list of all available elections.

```typescript
// No parameters required
```

### 2. get_election

Get detailed information about a specific election.

```typescript
{
  electionid: string  // The unique identifier for the election
}
```

### 3. get_last_published

Get the last published timestamp for a specific election.

```typescript
{
  electionid: string  // The unique identifier for the election
}
```

### 4. get_races

Get all races for a specific election.

```typescript
{
  electionid: string  // The unique identifier for the election
}
```

### 5. get_election_results

Get results for all races in an election, or for a specific race.

```typescript
{
  electionid: string   // The unique identifier for the election
  racenumber?: string  // Optional: specific race number
}
```

### 6. get_precinct_results

Get precinct-level results for a specific race in an election.

```typescript
{
  electionid: string   // The unique identifier for the election
  racenumber: string   // The race number
}
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Run Development Server

```bash
npm run dev
```

## API Reference

This server interfaces with the Dane County Elections API:

**Base URL**: `https://api.danecounty.gov`

### Endpoints

- `GET /api/v1/elections/list` - List all elections
- `GET /api/v1/elections/election/{electionid}` - Get election details
- `GET /api/v1/elections/lastpublished/{electionid}` - Get last published time
- `GET /api/v1/elections/races/{electionid}` - Get election races
- `GET /api/v1/elections/electionresults/{electionid}` - Get all election results
- `GET /api/v1/elections/electionresults/{electionid}/{racenumber}` - Get specific race results
- `GET /api/v1/elections/precinctresults/{electionid}/{racenumber}` - Get precinct results

## Deployment

### Next.js/Vercel Compatibility

While this server is designed to run as a standalone MCP server (using stdio), the TypeScript code is compatible with Next.js/Vercel environments. You can adapt the API functions for use in Next.js API routes:

```typescript
// app/api/elections/route.ts
import { makeApiRequest } from '@/lib/dane-county-api';

export async function GET() {
  const data = await makeApiRequest('/api/v1/elections/list');
  return Response.json(data);
}
```

## Error Handling

The server includes comprehensive error handling:

- **Network Errors**: Handles connection failures gracefully
- **API Errors**: Reports HTTP status codes and error messages
- **Validation Errors**: Checks for required parameters
- **JSON Parsing**: Handles malformed responses

All errors are returned to the client in a structured format.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for any purpose.

## Author

Tyler Herman

## Acknowledgments

- Dane County, Wisconsin for providing the Elections API
- Anthropic for the Model Context Protocol specification
- The MCP community for tools and best practices

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [MCP documentation](https://modelcontextprotocol.io)
- Review the [Dane County API documentation](https://api.danecounty.gov)

## Changelog

### 1.0.0 (2026-01-31)

- Initial release
- Support for all 7 Dane County Elections API endpoints
- TypeScript implementation with full type safety
- Comprehensive error handling
- MCP 0.5.0 compatibility
- Built-in fetch support (Node 18+)
