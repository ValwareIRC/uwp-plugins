# UnrealIRCd Web Panel - Plugin Repository

This is the official plugin repository for the [UnrealIRCd Web Panel v2](https://github.com/unrealircd/unrealircd-webpanel).

## Table of Contents

- [Installing Plugins](#installing-plugins)
- [Plugin Development Guide](#plugin-development-guide)
  - [Plugin Architecture](#plugin-architecture)
  - [Creating Your First Plugin](#creating-your-first-plugin)
  - [Plugin Manifest (plugin.json)](#plugin-manifest-pluginjson)
  - [Frontend JavaScript](#frontend-javascript)
  - [Navigation Items](#navigation-items)
  - [Dashboard Cards](#dashboard-cards)
  - [Settings Schema](#settings-schema)
- [Example Plugins](#example-plugins)
- [Submitting a Plugin](#submitting-a-plugin)
- [API Reference](#api-reference)

---

## Installing Plugins

Plugins from this repository can be installed directly from the Web Panel's Plugin Marketplace.

1. Navigate to **Marketplace** in the sidebar
2. Browse or search for plugins
3. Click **Install** on any plugin you want to add
4. Enable the plugin after installation

Installed plugins appear in the "Installed" tab where you can enable, disable, update, or uninstall them.

---

## Plugin Development Guide

### Plugin Architecture

UWP v2 plugins are **static JSON-based plugins** that can:

1. **Inject Frontend JavaScript** - Add custom behavior, UI elements, keyboard shortcuts, visual effects
2. **Add Navigation Items** - Create new pages accessible from the sidebar
3. **Contribute Dashboard Cards** - Display custom information on the dashboard
4. **Define Settings** - Allow users to configure plugin behavior

Plugins are defined by a `plugin.json` manifest file and optional frontend JavaScript files.

### Creating Your First Plugin

#### Step 1: Create the Plugin Directory

```
plugins/
└── my-plugin/
    ├── plugin.json        # Required: Plugin manifest
    ├── my-plugin.js       # Optional: Frontend JavaScript
    └── README.md          # Recommended: Documentation
```

#### Step 2: Create the Plugin Manifest

Create `plugin.json` with your plugin's configuration:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A short description of what your plugin does",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://github.com/yourusername/my-plugin",
  "min_panel_version": "2.0.0",
  "frontend_scripts": ["my-plugin.js"]
}
```

#### Step 3: Create Frontend JavaScript (Optional)

Create `my-plugin.js` for client-side functionality:

```javascript
(function() {
  'use strict';
  
  console.log('[My Plugin] Loaded!');
  
  // Your plugin code here
})();
```

#### Step 4: Test Your Plugin

1. Copy your plugin directory to `backend/internal/plugins/`
2. Restart the web panel
3. Install and enable via the Marketplace

---

### Plugin Manifest (plugin.json)

The `plugin.json` file defines your plugin's metadata and capabilities.

#### Complete Example

```json
{
  "id": "example-plugin",
  "name": "Example Plugin",
  "version": "1.0.0",
  "description": "A comprehensive example plugin demonstrating all features",
  "author": "Valware",
  "license": "MIT",
  "homepage": "https://github.com/ValwareIRC/uwp-plugins",
  "min_panel_version": "1.0.0",
  "hooks": [
    "OnStartup",
    "OnShutdown"
  ],
  "nav_items": [
    {
      "id": "example-plugin-demo",
      "label": "Plugin Demo",
      "icon": "Puzzle",
      "path": "/plugins/example-demo",
      "category": "Plugins",
      "order": 100
    }
  ],
  "dashboard_cards": [
    {
      "id": "example-plugin-card",
      "title": "Example Plugin",
      "icon": "Puzzle",
      "type": "info",
      "content": "This card is provided by the Example Plugin!",
      "order": 100
    }
  ],
  "frontend_scripts": [
    "example-plugin.js"
  ],
  "settings_schema": {
    "show_badge": {
      "type": "boolean",
      "label": "Show Active Badge",
      "description": "Display a badge indicating the plugin is active",
      "default": true
    },
    "custom_message": {
      "type": "string",
      "label": "Custom Message",
      "description": "Message to display in the plugin",
      "default": "Hello from the plugin!"
    }
  }
}
```

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (lowercase, hyphens allowed) |
| `name` | string | Display name for the plugin |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `description` | string | Brief description (recommended max 200 characters) |
| `author` | string | Your name or organization |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `license` | string | SPDX license identifier (e.g., "MIT", "GPL-3.0") |
| `homepage` | string | Link to plugin homepage or repository |
| `min_panel_version` | string | Minimum required panel version |
| `hooks` | array | Backend hooks the plugin uses (future use) |
| `nav_items` | array | Navigation items to add to the sidebar |
| `dashboard_cards` | array | Cards to display on the dashboard |
| `frontend_scripts` | array | JavaScript files to load on the frontend |
| `settings_schema` | object | Configuration options for the plugin |

---

### Frontend JavaScript

Frontend scripts are loaded automatically when the plugin is enabled. They run in the browser context and can interact with the DOM.

#### Basic Template

```javascript
(function() {
  'use strict';
  
  // Plugin initialization
  console.log('[MyPlugin] Initializing...');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('[MyPlugin] DOM ready, starting...');
    // Your initialization code here
  }
})();
```

#### Adding UI Elements

```javascript
(function() {
  'use strict';
  
  function createBadge() {
    // Check if badge already exists
    if (document.getElementById('my-plugin-badge')) return;
    
    const badge = document.createElement('div');
    badge.id = 'my-plugin-badge';
    badge.innerHTML = '🔌 Plugin Active';
    badge.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 8px 16px;
      background: var(--accent);
      color: white;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(badge);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBadge);
  } else {
    createBadge();
  }
})();
```

#### Adding Keyboard Shortcuts

```javascript
(function() {
  'use strict';
  
  document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+P to show plugin info
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      showPluginModal();
    }
  });
  
  function showPluginModal() {
    // Remove existing modal
    const existing = document.getElementById('my-plugin-modal');
    if (existing) existing.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'my-plugin-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: var(--bg-primary);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      ">
        <h2 style="color: var(--text-primary); margin: 0 0 16px 0;">
          🔌 My Plugin
        </h2>
        <p style="color: var(--text-secondary); margin: 0 0 16px 0;">
          Plugin is active and working!
        </p>
        <button onclick="this.closest('#my-plugin-modal').remove()" style="
          background: var(--accent);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    
    // Close on background click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  }
})();
```

#### Adding Visual Effects (Emoji Trail Example)

```javascript
(function() {
  'use strict';
  
  const EMOJIS = ['🎉', '✨', '🎊', '🌟', '💫'];
  
  document.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === 'e' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      // Don't trigger in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      createExplosion(window.innerWidth / 2, window.innerHeight / 2);
    }
  });
  
  function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
      createParticle(x, y);
    }
  }
  
  function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 24px;
      pointer-events: none;
      z-index: 10000;
      transition: all 1s ease-out;
    `;
    document.body.appendChild(particle);
    
    // Animate
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 150;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`;
      particle.style.opacity = '0';
    });
    
    setTimeout(() => particle.remove(), 1000);
  }
})();
```

---

### Navigation Items

Plugins can add navigation items to the sidebar under a "Plugins" category.

#### Configuration

```json
{
  "nav_items": [
    {
      "id": "my-plugin-page",
      "label": "My Plugin",
      "icon": "Puzzle",
      "path": "/plugins/my-plugin-page",
      "category": "Plugins",
      "order": 100
    }
  ]
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the nav item |
| `label` | string | Yes | Display text in the sidebar |
| `icon` | string | Yes | Lucide icon name (see below) |
| `path` | string | Yes | URL path (must start with `/plugins/`) |
| `category` | string | No | Category name (default: "Plugins") |
| `order` | number | No | Sort order (lower = higher in list) |

#### Available Icons

The following Lucide icons are available:

- `LayoutDashboard`, `Users`, `Hash`, `Server`, `ServerOff`
- `Shield`, `ShieldX`, `Settings`, `FileText`, `Filter`
- `BarChart`, `ScrollText`, `Globe`, `Eye`, `Clock`
- `Bell`, `FileBox`, `Activity`, `History`, `ClipboardList`
- `Network`, `Lock`, `MessageSquare`, `PieChart`, `Mail`
- `Puzzle`, `Ban`, `Gauge`, `Cog`

---

### Dashboard Cards

Plugins can contribute cards that appear on the dashboard.

#### Configuration

```json
{
  "dashboard_cards": [
    {
      "id": "my-plugin-card",
      "title": "My Plugin Status",
      "icon": "Activity",
      "type": "info",
      "content": "Plugin is running normally.",
      "order": 100
    }
  ]
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the card |
| `title` | string | Yes | Card title |
| `icon` | string | Yes | Lucide icon name |
| `type` | string | No | Card type: "info", "warning", "success", "error" |
| `content` | string/object | Yes | Card content (string or JSON object) |
| `order` | number | No | Sort order (lower = earlier) |

---

### Settings Schema

Define configuration options that users can customize.

#### Configuration

```json
{
  "settings_schema": {
    "enabled_feature": {
      "type": "boolean",
      "label": "Enable Feature",
      "description": "Turn this feature on or off",
      "default": true
    },
    "message_text": {
      "type": "string",
      "label": "Message",
      "description": "Custom message to display",
      "default": "Hello World"
    },
    "refresh_interval": {
      "type": "number",
      "label": "Refresh Interval",
      "description": "How often to refresh in seconds",
      "default": 30
    },
    "theme_color": {
      "type": "select",
      "label": "Theme Color",
      "description": "Choose a color theme",
      "options": ["blue", "green", "purple", "orange"],
      "default": "blue"
    }
  }
}
```

#### Supported Types

| Type | Description |
|------|-------------|
| `boolean` | True/false toggle |
| `string` | Text input |
| `number` | Numeric input |
| `select` | Dropdown with predefined options |

---

## Example Plugins

### Emoji Trail

A fun plugin that creates emoji firework explosions when you press the 'E' key.

**Features:**
- Multiple emoji themes (party, nature, hearts, stars, food)
- Colorful particle explosions
- Non-intrusive (doesn't trigger in input fields)

[View Source](./plugins/emoji-trail/)

### Example Plugin

A comprehensive example demonstrating all plugin features.

**Features:**
- Keyboard shortcut (Ctrl+Shift+P) for info modal
- Badge indicator showing plugin is active
- Navigation item in sidebar
- Dashboard card
- Settings schema

[View Source](./plugins/example-plugin/)

---

## Submitting a Plugin

Want to share your plugin with the community? Follow these steps:

### 1. Fork This Repository

```bash
git clone https://github.com/ValwareIRC/uwp-plugins.git
cd uwp-plugins
```

### 2. Create Your Plugin

```bash
mkdir plugins/your-plugin-id
cd plugins/your-plugin-id
# Create plugin.json and other files
```

### 3. Test Locally

Run the build script to validate your plugin:

```bash
node scripts/build-index.js
```

This will check that your `plugin.json` is valid and generate the index.

### 4. Submit a Pull Request

- Ensure your plugin follows the structure guidelines
- Include a README.md with usage instructions
- Test your plugin locally before submitting

The `plugins.json` index is **automatically generated** by GitHub Actions when your PR is merged - you don't need to update it manually!

### Plugin Categories

| Category | Description |
|----------|-------------|
| `security` | Security-related features |
| `integration` | Third-party service integrations |
| `monitoring` | Monitoring and alerting |
| `management` | Server/user management tools |
| `utilities` | General utilities |
| `appearance` | Visual customizations |
| `fun` | Fun/entertainment features |

---

## API Reference

### CSS Variables

Plugins should use these CSS variables for consistent theming:

```css
/* Colors */
var(--bg-primary)      /* Main background */
var(--bg-secondary)    /* Secondary background */
var(--bg-tertiary)     /* Tertiary background */
var(--bg-hover)        /* Hover state */

var(--text-primary)    /* Main text */
var(--text-secondary)  /* Secondary text */
var(--text-muted)      /* Muted text */

var(--accent)          /* Accent/brand color */
var(--accent-hover)    /* Accent hover state */

var(--border-primary)  /* Primary border */
var(--border-secondary) /* Secondary border */

/* Status colors */
var(--success)
var(--warning)
var(--error)
```

### DOM Elements

| Selector | Description |
|----------|-------------|
| `#plugin-content` | Content area on plugin pages |
| `.plugin-content-area` | Plugin content container class |
| `[data-plugin="plugin-id"]` | Elements with plugin attribution |

### Best Practices

1. **Namespace your code** - Wrap in IIFE to avoid global pollution
2. **Use CSS variables** - Ensure your plugin looks good in all themes
3. **Check for existing elements** - Prevent duplicate UI elements
4. **Clean up** - Remove elements and listeners when appropriate
5. **Handle errors gracefully** - Don't break the panel if something fails
6. **Test in multiple themes** - Light and dark modes should both work
7. **Avoid input field triggers** - Check `e.target.tagName` for keyboard shortcuts

---

## License

This repository and its contents are licensed under the GPLv3 License unless otherwise specified in individual plugin directories.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/ValwareIRC/uwp-plugins/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ValwareIRC/uwp-plugins/discussions)
- **IRC**: Join #unreal-webpanel on irc.unrealircd.org
