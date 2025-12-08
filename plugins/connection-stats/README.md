# Connection Statistics Plugin

Advanced connection statistics and analytics for UnrealIRCd Web Panel with historical tracking and trend analysis.

## Features

- Real-time connection statistics
- Historical data with configurable retention
- Hourly and daily aggregations
- Trend analysis
- Country-based user tracking
- API for custom integrations

## Installation

Install from the Plugin Marketplace in your Web Panel.

## Configuration

```json
{
  "retention_days": 30,
  "sample_interval": 5,
  "track_by_country": true
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retention_days` | integer | 30 | Days to retain historical data (7-365) |
| `sample_interval` | integer | 5 | Minutes between samples (1-60) |
| `track_by_country` | boolean | true | Enable country tracking |

## API Endpoints

### GET /api/plugins/connection-stats/stats/current

Get current statistics snapshot.

**Response:**
```json
{
  "current": {
    "timestamp": "2025-12-08T10:30:00Z",
    "total_users": 156,
    "local_users": 120,
    "global_users": 36,
    "channels": 45,
    "servers": 3,
    "opers": 5
  },
  "today_conns": 234,
  "today_discs": 198
}
```

### GET /api/plugins/connection-stats/stats/history

Get historical samples.

**Parameters:**
- `hours` (optional): Number of hours to retrieve (default: 24)

**Response:**
```json
{
  "samples": [...],
  "hours": 24,
  "count": 288
}
```

### GET /api/plugins/connection-stats/stats/hourly

Get hourly aggregated statistics.

**Response:**
```json
[
  {
    "hour": 0,
    "avg_users": 95.5,
    "max_users": 102,
    "min_users": 89,
    "connections": 45,
    "disconnections": 38
  },
  ...
]
```

### GET /api/plugins/connection-stats/stats/daily

Get daily aggregated statistics.

**Response:**
```json
[
  {
    "date": "2025-12-07",
    "peak_users": 189,
    "peak_time": "21:30",
    "avg_users": 142.5,
    "total_connections": 1250,
    "total_disconnections": 1180,
    "unique_users": 450
  }
]
```

### GET /api/plugins/connection-stats/stats/countries

Get user count by country.

**Response:**
```json
{
  "enabled": true,
  "countries": [
    {
      "country": "United States",
      "country_code": "US",
      "users": 45,
      "percentage": 28.8
    },
    ...
  ]
}
```

### GET /api/plugins/connection-stats/stats/trends

Get trend analysis.

**Response:**
```json
{
  "trend": "increasing",
  "change_percent": 12.5,
  "peak_hour": 21,
  "peak_users": 189,
  "sample_period": "24h"
}
```

## License

MIT License - see LICENSE file for details.
