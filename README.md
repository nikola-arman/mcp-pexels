# Pexels MCP Server

An MCP (Model Context Protocol) server that provides access to the Pexels Photos Search API.

## Features

- Search for photos using text queries
- Filter by orientation (landscape, portrait, square)
- Filter by size (large, medium, small)  
- Filter by dominant color
- Pagination support
- Localization support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Get a Pexels API key from [https://www.pexels.com/api/](https://www.pexels.com/api/)

3. Set your API key as an environment variable:
```bash
export PEXELS_API_KEY=your_api_key_here
```

Or create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
# Edit .env with your API key
```

4. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

### Available Tool

#### `search_photos`

Search for photos on Pexels.

**Parameters:**
- `query` (required): Search term for finding photos
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Number of results per page (default: 15, max: 80)
- `orientation` (optional): Filter by photo orientation (`landscape`, `portrait`, `square`)
- `size` (optional): Filter by photo size (`large`, `medium`, `small`)
- `color` (optional): Filter by dominant color (`red`, `orange`, `yellow`, `green`, `turquoise`, `blue`, `violet`, `pink`, `brown`, `black`, `gray`, `white`)
- `locale` (optional): The locale for the search (e.g., `en-US`, `pt-BR`)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total_results": 8000,
    "page": 1,
    "per_page": 15,
    "photos": [
      {
        "id": 415829,
        "width": 2651,
        "height": 3976,
        "url": "https://www.pexels.com/photo/nature-red-love-romantic-415829/",
        "photographer": "Pixabay",
        "photographer_url": "https://www.pexels.com/@pixabay",
        "avg_color": "#C0392B",
        "alt": "Red rose",
        "src": {
          "original": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
          "large": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
          "medium": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&h=350",
          "small": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&h=130",
          "tiny": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=280"
        }
      }
    ],
    "next_page": "https://api.pexels.com/v1/search?query=nature&page=2"
  }
}
```

## Claude Code Configuration

To use this MCP server with Claude Code, add it to your MCP settings:

```json
{
  "mcpServers": {
    "pexels": {
      "command": "node",
      "args": ["/path/to/pexels-mcp-server/dist/index.js"],
      "env": {
        "PEXELS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Development

Run in development mode:
```bash
npm run dev
```

## License

MIT