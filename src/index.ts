#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
  prev_page?: string;
}

class PexelsMCPServer {
  private server: Server;
  private apiKey: string;

  constructor() {
    this.server = new Server(
      {
        name: 'pexels-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiKey = process.env.PEXELS_API_KEY || '';
    if (!this.apiKey) {
      console.error('PEXELS_API_KEY environment variable is required');
      process.exit(1);
    }

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_photos',
            description: 'Search for photos on Pexels using a query term',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search term for finding photos',
                },
                page: {
                  type: 'number',
                  description: 'Page number (default: 1)',
                  minimum: 1,
                },
                per_page: {
                  type: 'number',
                  description: 'Number of results per page (default: 15, max: 80)',
                  minimum: 1,
                  maximum: 80,
                },
                orientation: {
                  type: 'string',
                  enum: ['landscape', 'portrait', 'square'],
                  description: 'Filter by photo orientation',
                },
                size: {
                  type: 'string',
                  enum: ['large', 'medium', 'small'],
                  description: 'Filter by photo size',
                },
                color: {
                  type: 'string',
                  enum: ['red', 'orange', 'yellow', 'green', 'turquoise', 'blue', 'violet', 'pink', 'brown', 'black', 'gray', 'white'],
                  description: 'Filter by dominant color',
                },
                locale: {
                  type: 'string',
                  description: 'The locale for the search (e.g., en-US, pt-BR)',
                },
              },
              required: ['query'],
            },
          } as Tool,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'search_photos') {
        return await this.handleSearchPhotos(request.params.arguments || {});
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  private async handleSearchPhotos(args: any) {
    try {
      const {
        query,
        page = 1,
        per_page = 15,
        orientation,
        size,
        color,
        locale,
      } = args;

      if (!query) {
        throw new Error('Query parameter is required');
      }

      const url = new URL('https://api.pexels.com/v1/search');
      url.searchParams.set('query', query);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('per_page', per_page.toString());

      if (orientation) {
        url.searchParams.set('orientation', orientation);
      }
      if (size) {
        url.searchParams.set('size', size);
      }
      if (color) {
        url.searchParams.set('color', color);
      }
      if (locale) {
        url.searchParams.set('locale', locale);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} - ${response.statusText}`);
      }

      const data: PexelsResponse = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                total_results: data.total_results,
                page: data.page,
                per_page: data.per_page,
                photos: data.photos.map(photo => ({
                  id: photo.id,
                  width: photo.width,
                  height: photo.height,
                  url: photo.url,
                  photographer: photo.photographer,
                  photographer_url: photo.photographer_url,
                  avg_color: photo.avg_color,
                  alt: photo.alt,
                  src: {
                    original: photo.src.original,
                    large: photo.src.large,
                    medium: photo.src.medium,
                    small: photo.src.small,
                    tiny: photo.src.tiny,
                  },
                })),
                next_page: data.next_page,
                prev_page: data.prev_page,
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  public async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

async function main() {
  const server = new PexelsMCPServer();
  await server.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}