# UnrealIRCd Web Panel - Plugin Repository

This is the official plugin repository for the [UnrealIRCd Web Panel](https://github.com/unrealircd/unrealircd-webpanel).

## Installing Plugins

Plugins from this repository can be installed directly from the Web Panel's Plugin Marketplace.

1. Navigate to **Plugins** in the sidebar
2. Browse or search for plugins
3. Click **Install** on any plugin you want to add

## Submitting a Plugin

Want to share your plugin with the community? Follow these steps:

### Plugin Requirements

Your plugin must include a `plugin.json` manifest file in its root directory with the following structure:

```json
{
  "id": "your-plugin-id",
  "name": "Your Plugin Name",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A brief description of what your plugin does",
  "category": "utilities",
  "license": "MIT",
  "repository": "https://github.com/username/repo",
  "tags": ["tag1", "tag2"],
  "min_panel_version": "2.0.0",
  "entry_point": "main.go",
  "hooks": ["on_user_connect", "on_channel_join"]
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (lowercase, hyphens only) |
| `name` | Display name for the plugin |
| `version` | Semantic version (e.g., "1.0.0") |
| `author` | Your name or organization |
| `description` | Brief description (max 200 characters) |
| `category` | One of: `security`, `integration`, `monitoring`, `management`, `utilities`, `appearance` |
| `license` | SPDX license identifier (e.g., "MIT", "GPL-3.0") |
| `entry_point` | Main plugin file |

### Optional Fields

| Field | Description |
|-------|-------------|
| `repository` | Link to source code repository |
| `tags` | Array of searchable tags |
| `min_panel_version` | Minimum required panel version |
| `hooks` | Array of hooks the plugin uses |
| `dependencies` | Array of required plugin IDs |
| `config_schema` | JSON Schema for plugin configuration |

### Plugin Structure

```
plugins/your-plugin-id/
├── plugin.json          # Required: Plugin manifest
├── main.go              # Required: Main plugin entry point
├── README.md            # Recommended: Documentation
├── LICENSE              # Recommended: License file
├── config.example.json  # Optional: Example configuration
└── assets/              # Optional: Static assets
    └── icon.png         # Optional: Plugin icon (128x128 PNG)
```

### Submitting

1. Fork this repository
2. Create your plugin directory under `plugins/your-plugin-id/`
3. Add all required files
4. Submit a Pull Request

Our automated CI will validate your plugin manifest and run basic checks. Once approved, your plugin will be automatically added to the marketplace index.

## Available Hooks

Plugins can register handlers for these events:

### User Events
- `on_user_connect` - User connects to the network
- `on_user_disconnect` - User disconnects
- `on_user_nick_change` - User changes nickname
- `on_user_quit` - User quits

### Channel Events
- `on_channel_join` - User joins a channel
- `on_channel_part` - User leaves a channel
- `on_channel_message` - Message sent to channel
- `on_channel_mode` - Channel mode change

### Server Events
- `on_server_link` - Server links to network
- `on_server_split` - Server disconnects
- `on_rehash` - Server configuration reloaded

### Admin Events
- `on_oper_up` - User becomes IRC operator
- `on_ban_add` - Ban (G-line, K-line, etc.) added
- `on_ban_remove` - Ban removed

## Plugin API

See the [Plugin Development Guide](https://github.com/unrealircd/unrealircd-webpanel/wiki/Plugin-Development) for detailed API documentation.

## Index

The `plugins.json` file in the root of this repository is automatically generated and contains metadata for all available plugins. This file is fetched by the Web Panel to populate the marketplace.

## License

This repository and its contents are licensed under the MIT License unless otherwise specified in individual plugin directories.
