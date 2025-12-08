# Emoji Trail Plugin for UnrealIRCd Web Panel 🎉

Add some fun to your admin panel! This plugin creates delightful emoji fireworks that burst from your cursor whenever you press the 'E' key.

## Features

- 🎆 **Colorful emoji bursts** - Watch emoji explode like fireworks from your cursor
- ⌨️ **Customizable trigger key** - Change which key activates the effect
- 🎨 **Multiple emoji sets** - Choose from party, nature, hearts, stars, food, or random
- ⚙️ **Adjustable intensity** - Configure particle count and burst size
- 🚫 **Smart detection** - Won't trigger when typing in input fields

## Demo

Press the **E** key anywhere on the panel (except input fields) to see emoji fireworks!

## Emoji Sets

| Set | Emoji Preview |
|-----|---------------|
| **party** | 🎉 🎊 🥳 🎈 🎁 ✨ 💫 🌟 |
| **nature** | 🌸 🌺 🌻 🌷 🍀 🦋 🐝 🌈 |
| **hearts** | ❤️ 🧡 💛 💚 💙 💜 💖 💝 |
| **stars** | ⭐ 🌟 ✨ 💫 🌠 ⚡ 🔥 💥 |
| **food** | 🍕 🍔 🍟 🌮 🍩 🍪 🎂 🍰 |
| **random** | 🎉 🌟 ❤️ 🦄 🌈 🔥 💎 🚀 |

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enabled` | boolean | true | Enable or disable the effect |
| `trigger_key` | string | "e" | Key that triggers the emoji burst |
| `emoji_set` | enum | "party" | Which emoji set to use |
| `particle_count` | integer | 12 | Number of emoji per burst (5-30) |
| `burst_size` | integer | 150 | Radius of the burst in pixels (50-300) |

## API Endpoints

- `GET /api/plugin/emoji-trail/config` - Get current configuration
- `PUT /api/plugin/emoji-trail/config` - Update configuration
- `GET /api/plugin/emoji-trail/script.js` - The emoji trail JavaScript

## Installation

1. Go to **Admin > Plugins** in your web panel
2. Search for "Emoji Trail"
3. Click **Install**
4. Start pressing E! 🎉

## Technical Details

The plugin injects a lightweight JavaScript that:
- Tracks cursor position via `mousemove` events
- Listens for keydown events on the configured key
- Creates animated emoji particles using CSS transforms
- Uses `requestAnimationFrame` for smooth 60fps animations
- Automatically cleans up particles after animation completes

Performance impact is minimal - particles only exist during animation (~1 second each).

## Why?

Because sometimes you just need a little joy while managing your IRC network. 😊

## License

MIT License - Spread the emoji joy!

## Author

**ValwareIRC**  
- GitHub: [@ValwareIRC](https://github.com/ValwareIRC)
