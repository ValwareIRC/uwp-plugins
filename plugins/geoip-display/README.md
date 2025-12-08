# GeoIP Display Plugin

A plugin for UnrealIRCd Web Panel that displays geographic location information for connected users.

## Features

- Display country, region, and city for connected users
- Batch IP lookup support
- Caching for improved performance
- Country flags and map integration ready

## Installation

1. Install from the Plugin Marketplace in your Web Panel
2. (Optional) Configure a MaxMind GeoLite2 database for accurate lookups

## Configuration

```json
{
  "geoip_database": "/usr/share/GeoIP/GeoLite2-City.mmdb",
  "show_city": true,
  "show_region": true
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `geoip_database` | string | `/usr/share/GeoIP/GeoLite2-City.mmdb` | Path to MaxMind database |
| `show_city` | boolean | `true` | Show city-level detail |
| `show_region` | boolean | `true` | Show region/state |

## API Endpoints

### GET /api/plugins/geoip-display/geoip/:ip

Look up geographic data for a single IP address.

**Response:**
```json
{
  "ip": "8.8.8.8",
  "country_code": "US",
  "country_name": "United States",
  "region": "California",
  "city": "Mountain View",
  "latitude": 37.386,
  "longitude": -122.0838
}
```

### POST /api/plugins/geoip-display/geoip/batch

Look up multiple IPs at once (max 100).

**Request:**
```json
{
  "ips": ["8.8.8.8", "1.1.1.1"]
}
```

## GeoIP Database

For accurate lookups, this plugin supports MaxMind GeoLite2 databases:

1. Create a free MaxMind account at https://www.maxmind.com
2. Download GeoLite2-City.mmdb
3. Configure the path in plugin settings

Without a database, the plugin uses demo data for demonstration purposes.

## License

MIT License - see LICENSE file for details.
