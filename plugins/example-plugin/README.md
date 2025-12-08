# Example Plugin for UnrealIRCd Web Panel

A demonstration plugin showing how to extend the UnrealIRCd Web Panel with custom features.

## Features

This plugin demonstrates all major extension points available to plugin developers:

### 🧭 Custom Navigation
Adds a new "Example Page" item to the sidebar navigation, demonstrating how plugins can add their own pages to the panel.

### 📊 Dashboard Cards
Adds a dashboard card showing:
- Custom welcome message
- Plugin uptime
- Action counter
- Configurable accent color

### 🔌 API Endpoints
Provides custom REST API endpoints:
- `GET /api/plugin/example/data` - Retrieve plugin information
- `POST /api/plugin/example/action` - Log a custom action
- `GET /api/plugin/example/log` - View the action log
- `PUT /api/plugin/example/config` - Update plugin settings

### 🪝 Hook Callbacks
Demonstrates registering callbacks for:
- `HookNavbar` - Adding navigation items
- `HookOverviewCard` - Adding dashboard cards
- `HookFooter` - Modifying the page footer
- `HookUserLookup` - Enriching user lookup data

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `welcome_message` | string | "Hello from the Example Plugin!" | Custom message on dashboard card |
| `show_user_count` | boolean | true | Show live user count on the example page |
| `card_color` | enum | "purple" | Accent color (blue/green/purple/orange) |

## Installation

1. Go to **Admin > Plugins** in your web panel
2. Search for "Example Plugin"
3. Click **Install**
4. The plugin will be enabled automatically

## For Developers

This plugin serves as a template for creating your own plugins. Key files:

- `plugin.json` - Plugin metadata and configuration schema
- `main.go` - Plugin implementation with hooks and API routes

### Creating Your Own Plugin

1. Copy this plugin's directory structure
2. Modify `plugin.json` with your plugin's metadata
3. Implement the `Plugin` interface in `main.go`
4. Register your hooks in the `Init()` function
5. Add API routes via `RegisterRoutes()`

## License

MIT License - Feel free to use this as a template for your own plugins!

## Author

**ValwareIRC**  
- GitHub: [@ValwareIRC](https://github.com/ValwareIRC)
- Website: [valware.co.uk](https://valware.co.uk)
