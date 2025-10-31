# Kalkul MCP Server

The Kalkul MCP (Model Context Protocol) server provides AI agents with access to the same financial planning database operations available in the web application.

## Overview

The MCP server is implemented as a SvelteKit API endpoint at `/api/mcp` and follows the full Model Context Protocol specification using JSON-RPC 2.0. It exposes all the functionality from the `Adapter` interface, allowing AI agents to:

- Manage user authentication
- Create and manage clients
- Build financial portfolios
- Add investments and transactions
- Access market data
- Perform all CRUD operations on financial planning data

The server implements the complete MCP lifecycle including the `initialize` handshake, ensuring full compatibility with MCP clients like Claude Desktop and ChatGPT.

## Authentication

### Demo Account

For testing and demonstration purposes, a demo account is available.

- **Email**: `demo@kalkul.app`
- **Password**: `demo123`
- **API Token**: `kalkul_1234567890123456789012345678901234567890123`

You can use this token to test the API without creating an account.

The MCP server supports two authentication methods:

### Personal Access Tokens (Recommended)

Personal Access Tokens (PATs) provide a secure way to authenticate with the MCP server without exposing your password. This is the recommended method for AI integrations like Claude Desktop and ChatGPT.

**Creating a PAT:**

1. Log in to your Kalkul account at https://kalkul.app
2. Navigate to API Tokens page (`/api-tokens`)
3. Click "Create Token" and give it a descriptive name (e.g., "Claude Desktop", "ChatGPT Integration")
4. Copy the token immediately - it won't be shown again!
5. Store the token securely

**Using a PAT:**

The MCP server accepts tokens via three methods:

**Method 1: Authorization Header (Recommended for API clients)**

```bash
curl -X POST https://kalkul.app/api/mcp \
  -H "Authorization: Bearer kalkul_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_clients",
      "arguments": {}
    }
  }'
```

**Method 2: X-API-Key Header**

```bash
curl -X POST https://kalkul.app/api/mcp \
  -H "X-API-Key: kalkul_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_clients",
      "arguments": {}
    }
  }'
```

**Method 3: Query Parameter (For Claude on the web)**

```bash
curl -X POST "https://kalkul.app/api/mcp?token=kalkul_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_clients",
      "arguments": {}
    }
  }'
```

**MCP Configuration (Claude Desktop):**

Add this to your `claude_desktop_config.json`:

```json
{
	"mcpServers": {
		"kalkul": {
			"url": "https://kalkul.app/api/mcp",
			"headers": {
				"Authorization": "Bearer kalkul_your_token_here"
			}
		}
	}
}
```

**MCP Configuration (Claude on the Web):**

When adding Kalkul as a custom MCP connector in Claude on the web:

1. **MCP Server URL**: `https://kalkul.app/api/mcp?token=kalkul_your_token_here`
2. **OAuth Client ID**: Leave empty (not using OAuth)
3. **OAuth Client Secret**: Leave empty (not using OAuth)

Replace `kalkul_your_token_here` with your actual token from `/api-tokens`.

**Benefits of PATs:**

- Long-lived tokens that don't expire (until revoked)
- Can be revoked without changing your password
- Multiple tokens for different applications
- More secure than embedding email/password
- Tracked usage (last used timestamp)

## Endpoints

- **GET** `/api/mcp` - Returns server information and usage instructions
- **GET** `/api/mcp?method=tools/list` - Returns list of available tools
- **POST** `/api/mcp` - Handles JSON-RPC 2.0 requests including initialization and tool execution

## MCP Protocol Lifecycle

The server follows the Model Context Protocol lifecycle:

### 1. Initialize Handshake

First, clients must send an `initialize` request:

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "initialize",
	"params": {
		"protocolVersion": "2024-11-05",
		"capabilities": {},
		"clientInfo": {
			"name": "your-client-name",
			"version": "1.0.0"
		}
	}
}
```

Server response:

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"protocolVersion": "2024-11-05",
		"capabilities": {
			"tools": {
				"listChanged": false
			}
		},
		"serverInfo": {
			"name": "kalkul-financial-planning",
			"version": "1.0.0"
		}
	}
}
```

### 2. Complete Initialization (Optional)

Clients can send an `initialized` notification:

```json
{
	"jsonrpc": "2.0",
	"method": "notifications/initialized"
}
```

Server responds with `202 Accepted` (no body).

### 3. List Available Tools

```json
{
	"jsonrpc": "2.0",
	"id": 2,
	"method": "tools/list",
	"params": {}
}
```

Server response:

```json
{
	"jsonrpc": "2.0",
	"id": 2,
	"result": {
		"tools": [
			{
				"name": "get_clients",
				"description": "Get all clients for the current user",
				"inputSchema": {
					"type": "object",
					"properties": {},
					"required": []
				}
			}
			// ... more tools
		]
	}
}
```

### 4. Call Tools

```json
{
	"jsonrpc": "2.0",
	"id": 3,
	"method": "tools/call",
	"params": {
		"name": "get_clients",
		"arguments": {}
	}
}
```

Server response:

```json
{
	"jsonrpc": "2.0",
	"id": 3,
	"result": {
		"content": [
			{
				"type": "text",
				"text": "[{\"id\": 1, \"name\": \"John Doe\", ...}]"
			}
		]
	}
}
```

## Request Format

The server accepts JSON-RPC 2.0 requests. All requests must include:

- `jsonrpc`: Must be `"2.0"`
- `id`: Request identifier (number or string) - omit for notifications
- `method`: The method name (`initialize`, `tools/list`, `tools/call`, etc.)
- `params`: Method parameters (optional, depending on method)

Example:

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/call",
	"params": {
		"name": "tool_name",
		"arguments": {
			"param1": "value1",
			"param2": "value2"
		}
	}
}
```

## Response Format

All responses follow JSON-RPC 2.0 format:

**Success response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"content": [
			{
				"type": "text",
				"text": "Response message or JSON data"
			}
		]
	}
}
```

**Error response:**

````json
{
	"jsonrpc": "2.0",
	"id": 1,
	"error": {
		"code": -32000,
		"message": "Error message",
		"data": {
			"content": [
				{
					"type": "text",
					"text": "Additional error details"
				}
			]
		}
	}
}

## Available Tools

### ChatGPT Required Tools

#### `search`
Search across clients, portfolios, and investments.
- **query** (string, required): Search query (searches names, labels, descriptions)
- **entity_type** (string, optional): Type of entity to search. Use "all" to search everything. Enum: ["client", "portfolio", "investment", "all"]
- **limit** (number, optional): Maximum number of results to return. Default: 10

#### `fetch`
Fetch complete details for a specific entity by ID.
- **entity_type** (string, required): Type of entity to fetch. Enum: ["client", "portfolio", "investment", "transaction"]
- **id** (number, required): Entity ID

### Client Management Tools

#### `get_clients`
Get all clients for the current user.
- No parameters.

#### `add_client`
Create a new client profile.
- **first_name** (string, required): Client first name
- **last_name** (string, required): Client last name
- **email** (string, required): Client email address
- **birth_date** (string, optional): Client birth date (YYYY-MM-DD, optional). Default: "1980-01-01"

#### `update_client`
Update client information.
- **id** (number, required): Client ID
- **name** (string, optional): Client full name
- **email** (string, optional): Client email address
- **birth_date** (string, optional): Client birth date (YYYY-MM-DD)

#### `delete_client`
Delete a client and all associated data.
- **id** (number, required): Client ID to delete

### Portfolio Management Tools

#### `get_portfolios`
Get all portfolios for a specific client.
- **client_id** (number, required): Client ID to get portfolios for

#### `add_portfolio`
Create a new portfolio for a client.
- **client_id** (number, required): Client ID
- **name** (string, required): Portfolio name
- **start_date** (string, required): Start date (YYYY-MM-DD)
- **end_date** (string, required): End date (YYYY-MM-DD)
- **currency** (string, optional): Portfolio currency (CZK, EUR, USD). Default: "CZK"
- **inflation_rate** (number, optional): Annual inflation rate (as decimal). Default: 0.03

#### `update_portfolio`
Update portfolio information.
- **id** (number, required): Portfolio ID
- **client_id** (number, optional): Client ID
- **name** (string, optional): Portfolio name
- **start_date** (string, optional): Start date (YYYY-MM-DD)
- **end_date** (string, optional): End date (YYYY-MM-DD)
- **currency** (string, optional): Portfolio currency
- **inflation_rate** (number, optional): Annual inflation rate

#### `delete_portfolio`
Delete a portfolio and all associated data.
- **id** (number, required): Portfolio ID to delete

#### `duplicate_portfolio`
Duplicate a portfolio with all its investments and transactions.
- **client_id** (number, required): Client ID who owns the portfolio
- **portfolio_id** (number, required): Portfolio ID to duplicate
- **new_name** (string, required): New name for the duplicated portfolio

#### `get_portfolio_view`
Get complete portfolio data including client, investments, and transactions.
- **id** (string, required): Portfolio ID

### Investment Management Tools

#### `add_investment`
Add an investment to a portfolio.
- **portfolio_id** (number, required): Portfolio ID
- **name** (string, required): Investment name
- **apy** (number, required): Annual percentage yield (as decimal)
- **management_fee** (number, optional): Management fee (as decimal)
- **success_fee** (number, optional): Success fee (as decimal)
- **ter** (number, optional): Total expense ratio (as decimal)
- **entry_fee** (number, optional): Entry fee (as decimal)
- **exit_fee** (number, optional): Exit fee (as decimal)
- **advanced_fees** (boolean, optional): Whether to use advanced fee structure. Default: false
- **type** (string, optional): Investment type. Default: "investment"

#### `update_investment`
Update investment information.
- **id** (number, required): Investment ID
- **name** (string, optional): Investment name
- **apy** (number, optional): Annual percentage yield (as decimal)
- **management_fee** (number, optional): Management fee (as decimal)
- **success_fee** (number, optional): Success fee (as decimal)
- **ter** (number, optional): Total expense ratio (as decimal)
- **entry_fee** (number, optional): Entry fee (as decimal)
- **exit_fee** (number, optional): Exit fee (as decimal)
- **advanced_fees** (boolean, optional): Whether to use advanced fee structure
- **type** (string, optional): Investment type

#### `delete_investment`
Delete an investment.
- **id** (number, required): Investment ID to delete

### Transaction Management Tools

#### `add_transaction`
Add a transaction (deposit or withdrawal) to an investment.
- **investment_id** (number, required): Investment ID
- **type** (string, required): Transaction type ("deposit" or "withdrawal")
- **amount** (number, required): Transaction amount
- **start_date** (string, required): Transaction start date (YYYY-MM-DD)
- **end_date** (string, optional): Transaction end date (YYYY-MM-DD, optional for one-time)
- **repeat_unit** (string, optional): Repeat unit for recurring transactions ("month" or "year")
- **repeat** (number, optional): Repeat frequency (e.g., every 2 months). Default: 1
- **label** (string, optional): Transaction label
- **inflation_adjusted** (boolean, optional): Whether the transaction amount is inflation adjusted

#### `update_transaction`
Update transaction information.
- **id** (number, required): Transaction ID
- **investment_id** (number, optional): Investment ID
- **type** (string, optional): Transaction type
- **amount** (number, optional): Transaction amount
- **start_date** (string, optional): Transaction start date (YYYY-MM-DD)
- **end_date** (string, optional): Transaction end date (YYYY-MM-DD)
- **repeat_unit** (string, optional): Repeat unit
- **repeat** (number, optional): Repeat frequency
- **label** (string, optional): Transaction label
- **inflation_adjusted** (boolean, optional): Whether the transaction amount is inflation adjusted

#### `delete_transaction`
Delete a transaction.
- **id** (number, required): Transaction ID to delete

### Market Data Tools

#### `get_market_data`
Get market data for an investment by ISIN or ticker.
- **identifier** (string, required): ISIN or ticker symbol
- **id_type** (string, optional): Identifier type ("isin" or "ticker"). Default: "isin"
- **updated_after** (string, optional): Only return data updated after this date (ISO string)

#### `add_market_data`
Cache market data for an investment.
- **identifier** (string, required): ISIN or ticker symbol
- **id_type** (string, required): Identifier type
- **data** (object, required): Market data to cache

#### `report_isin_error`
Report an error with ISIN lookup.
- **identifier** (string, required): ISIN that caused error
- **error** (object, required): Error details

### Financial Calculation Tools

#### `calculate_portfolio_projection`
Calculate complete portfolio projection with all investments over time.
- **portfolio_id** (number, required): Portfolio ID to calculate projections for

#### `calculate_investment_projection`
Calculate projection for a single investment.
- **investment_id** (number, required): Investment ID to calculate projection for

#### `get_current_portfolio_value`
Get the current total value of a portfolio as of today.
- **portfolio_id** (number, required): Portfolio ID to get current value for

#### `evaluate_withdrawal_scenario`
Test a modified withdrawal scenario and compare with baseline.
- **investment_id** (number, required): Investment ID to modify
- **new_withdrawal_amount** (number, required): New monthly withdrawal amount
- **start_date** (string, required): Withdrawal start date (YYYY-MM-DD)
- **end_date** (string, optional): Withdrawal end date (YYYY-MM-DD)

#### `compare_investment_scenarios`
Compare baseline vs modified investment parameters (APY, fees, etc.).
- **investment_id** (number, required): Investment ID to modify
- **modifications** (object, required): Investment parameters to modify
    - **apy** (number, optional): New APY rate (as percentage, e.g., 7.2)
    - **management_fee** (number, optional): New management fee (as percentage)
    - **ter** (number, optional): New TER fee (as percentage)
    - **success_fee** (number, optional): New success fee (as percentage)
    - **entry_fee** (number, optional): New entry fee (as percentage)
    - **exit_fee** (number, optional): New exit fee (as percentage)

## Usage Examples

### Creating a Complete Financial Plan

1. **Authenticate**: Use your Personal Access Token (PAT) in the Authorization header
2. **Create client**: Add client profile
3. **Create portfolio**: Set up investment timeline
4. **Add investments**: Define investment vehicles
5. **Add transactions**: Set up deposits and withdrawals
6. **Get portfolio view**: Retrieve complete financial plan

### Sample Workflow

All requests require authentication via Personal Access Token. Include your token in the Authorization header:

```bash
Authorization: Bearer kalkul_your_token_here
````

Example request to add a client:

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "tools/call",
	"params": {
		"name": "add_client",
		"arguments": {
			"first_name": "John",
			"last_name": "Doe",
			"email": "john.doe@example.com"
		}
	}
}
```

Example request to add a portfolio:

```json
{
	"jsonrpc": "2.0",
	"id": 2,
	"method": "tools/call",
	"params": {
		"name": "add_portfolio",
		"arguments": {
			"client_id": 1,
			"name": "Retirement Plan",
			"start_date": "2024-01-01",
			"end_date": "2044-01-01",
			"initial_age": 35,
			"currency": "USD",
			"inflation_rate": 0.025
		}
	}
}
```

## Integration

The MCP server integrates seamlessly with:

- **Database**: Uses existing Supabase adapter for all data operations
- **Authentication**: Leverages existing auth system
- **Types**: Shares TypeScript types with the main application
- **Business Logic**: Uses the same validation and calculation logic

## Security

- All operations require proper authentication
- Row-level security policies are enforced at the database level
- User can only access their own data
- Input validation matches the web application

## Error Handling

The server returns structured error responses:

```json
{
	"content": [
		{
			"type": "text",
			"text": "Error message describing what went wrong"
		}
	],
	"isError": true
}
```

## Development

The MCP server is part of the main Kalkul application:

- Located at `src/routes/api/mcp/+server.ts`
- Uses existing dependencies and configuration
- Shares types from `src/lib/types.ts`
- Integrates with the Supabase adapter at `src/lib/adapters/supabase/`
