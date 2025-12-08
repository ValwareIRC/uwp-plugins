package main

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Plugin metadata
var PluginInfo = struct {
	ID      string
	Name    string
	Version string
}{
	ID:      "connection-stats",
	Name:    "Connection Statistics",
	Version: "1.0.0",
}

// Config holds plugin configuration
type Config struct {
	RetentionDays   int  `json:"retention_days"`
	SampleInterval  int  `json:"sample_interval"`
	TrackByCountry  bool `json:"track_by_country"`
}

// ConnectionSample represents a point-in-time snapshot
type ConnectionSample struct {
	Timestamp    time.Time `json:"timestamp"`
	TotalUsers   int       `json:"total_users"`
	LocalUsers   int       `json:"local_users"`
	GlobalUsers  int       `json:"global_users"`
	Channels     int       `json:"channels"`
	Servers      int       `json:"servers"`
	Opers        int       `json:"opers"`
}

// HourlyStats represents aggregated hourly statistics
type HourlyStats struct {
	Hour        int     `json:"hour"`
	AvgUsers    float64 `json:"avg_users"`
	MaxUsers    int     `json:"max_users"`
	MinUsers    int     `json:"min_users"`
	Connections int     `json:"connections"`
	Disconnects int     `json:"disconnections"`
}

// DailyStats represents aggregated daily statistics
type DailyStats struct {
	Date        string  `json:"date"`
	PeakUsers   int     `json:"peak_users"`
	PeakTime    string  `json:"peak_time"`
	AvgUsers    float64 `json:"avg_users"`
	TotalConns  int     `json:"total_connections"`
	TotalDisc   int     `json:"total_disconnections"`
	UniqueUsers int     `json:"unique_users"`
}

// CountryStats tracks users by country
type CountryStats struct {
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	Users       int    `json:"users"`
	Percentage  float64 `json:"percentage"`
}

var (
	config         Config
	samples        []ConnectionSample
	dailyStats     []DailyStats
	hourlyStats    [24]HourlyStats
	countryStats   map[string]*CountryStats
	mutex          sync.RWMutex
	connectCount   int
	disconnectCount int
	stopChan       chan struct{}
)

// Initialize is called when the plugin is loaded
func Initialize(cfg json.RawMessage) error {
	config = Config{
		RetentionDays:  30,
		SampleInterval: 5,
		TrackByCountry: true,
	}

	if len(cfg) > 0 {
		if err := json.Unmarshal(cfg, &config); err != nil {
			return err
		}
	}

	samples = make([]ConnectionSample, 0)
	dailyStats = make([]DailyStats, 0)
	countryStats = make(map[string]*CountryStats)
	stopChan = make(chan struct{})

	// Initialize hourly stats
	for i := 0; i < 24; i++ {
		hourlyStats[i] = HourlyStats{Hour: i}
	}

	// Start background sampling
	go runSampler()

	return nil
}

// RegisterRoutes registers plugin API endpoints
func RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/stats/current", handleCurrentStats)
	router.GET("/stats/history", handleHistoricalStats)
	router.GET("/stats/hourly", handleHourlyStats)
	router.GET("/stats/daily", handleDailyStats)
	router.GET("/stats/countries", handleCountryStats)
	router.GET("/stats/trends", handleTrends)
}

// handleCurrentStats returns current connection statistics
func handleCurrentStats(c *gin.Context) {
	mutex.RLock()
	defer mutex.RUnlock()

	var current ConnectionSample
	if len(samples) > 0 {
		current = samples[len(samples)-1]
	}

	c.JSON(http.StatusOK, gin.H{
		"current":      current,
		"today_conns":  connectCount,
		"today_discs":  disconnectCount,
		"sample_count": len(samples),
	})
}

// handleHistoricalStats returns historical samples
func handleHistoricalStats(c *gin.Context) {
	hours := 24 // Default to last 24 hours
	if h := c.Query("hours"); h != "" {
		// Parse hours parameter
	}

	mutex.RLock()
	defer mutex.RUnlock()

	// Filter samples by time range
	cutoff := time.Now().Add(-time.Duration(hours) * time.Hour)
	filtered := make([]ConnectionSample, 0)

	for _, s := range samples {
		if s.Timestamp.After(cutoff) {
			filtered = append(filtered, s)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"samples":  filtered,
		"hours":    hours,
		"count":    len(filtered),
	})
}

// handleHourlyStats returns hourly aggregated statistics
func handleHourlyStats(c *gin.Context) {
	mutex.RLock()
	defer mutex.RUnlock()

	c.JSON(http.StatusOK, hourlyStats)
}

// handleDailyStats returns daily aggregated statistics  
func handleDailyStats(c *gin.Context) {
	mutex.RLock()
	defer mutex.RUnlock()

	c.JSON(http.StatusOK, dailyStats)
}

// handleCountryStats returns user count by country
func handleCountryStats(c *gin.Context) {
	if !config.TrackByCountry {
		c.JSON(http.StatusOK, gin.H{
			"enabled": false,
			"message": "Country tracking is disabled",
		})
		return
	}

	mutex.RLock()
	defer mutex.RUnlock()

	// Convert map to slice and sort by count
	stats := make([]*CountryStats, 0, len(countryStats))
	for _, cs := range countryStats {
		stats = append(stats, cs)
	}

	c.JSON(http.StatusOK, gin.H{
		"enabled":   true,
		"countries": stats,
	})
}

// handleTrends returns trend analysis
func handleTrends(c *gin.Context) {
	mutex.RLock()
	defer mutex.RUnlock()

	// Calculate trends from samples
	var trend string
	var change float64

	if len(samples) >= 2 {
		recent := samples[len(samples)-1].TotalUsers
		older := samples[0].TotalUsers
		if older > 0 {
			change = float64(recent-older) / float64(older) * 100
		}

		if change > 5 {
			trend = "increasing"
		} else if change < -5 {
			trend = "decreasing"
		} else {
			trend = "stable"
		}
	} else {
		trend = "insufficient_data"
	}

	// Find peak hour
	peakHour := 0
	peakUsers := 0
	for i, h := range hourlyStats {
		if h.MaxUsers > peakUsers {
			peakUsers = h.MaxUsers
			peakHour = i
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"trend":          trend,
		"change_percent": change,
		"peak_hour":      peakHour,
		"peak_users":     peakUsers,
		"sample_period":  "24h",
	})
}

// runSampler collects periodic samples
func runSampler() {
	ticker := time.NewTicker(time.Duration(config.SampleInterval) * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			collectSample()
			cleanupOldData()
		case <-stopChan:
			return
		}
	}
}

// collectSample takes a snapshot of current stats
func collectSample() {
	// In production, this would call the panel API to get real stats
	// For demo, generate sample data
	sample := ConnectionSample{
		Timestamp:   time.Now(),
		TotalUsers:  100 + int(time.Now().Unix()%50),
		LocalUsers:  80 + int(time.Now().Unix()%30),
		GlobalUsers: 20 + int(time.Now().Unix()%20),
		Channels:    50 + int(time.Now().Unix()%25),
		Servers:     3,
		Opers:       5,
	}

	mutex.Lock()
	samples = append(samples, sample)

	// Update hourly stats
	hour := time.Now().Hour()
	hourlyStats[hour].AvgUsers = float64(sample.TotalUsers)
	if sample.TotalUsers > hourlyStats[hour].MaxUsers {
		hourlyStats[hour].MaxUsers = sample.TotalUsers
	}
	if hourlyStats[hour].MinUsers == 0 || sample.TotalUsers < hourlyStats[hour].MinUsers {
		hourlyStats[hour].MinUsers = sample.TotalUsers
	}

	mutex.Unlock()
}

// cleanupOldData removes data older than retention period
func cleanupOldData() {
	cutoff := time.Now().AddDate(0, 0, -config.RetentionDays)

	mutex.Lock()
	defer mutex.Unlock()

	// Remove old samples
	newSamples := make([]ConnectionSample, 0)
	for _, s := range samples {
		if s.Timestamp.After(cutoff) {
			newSamples = append(newSamples, s)
		}
	}
	samples = newSamples
}

// OnUserConnect is called when a user connects
func OnUserConnect(userData map[string]interface{}) {
	mutex.Lock()
	connectCount++

	// Track by country if enabled
	if config.TrackByCountry {
		if country, ok := userData["country"].(string); ok {
			if _, exists := countryStats[country]; !exists {
				countryStats[country] = &CountryStats{
					Country:     country,
					CountryCode: country,
				}
			}
			countryStats[country].Users++
		}
	}
	mutex.Unlock()
}

// OnUserDisconnect is called when a user disconnects
func OnUserDisconnect(userData map[string]interface{}) {
	mutex.Lock()
	disconnectCount++

	if config.TrackByCountry {
		if country, ok := userData["country"].(string); ok {
			if cs, exists := countryStats[country]; exists && cs.Users > 0 {
				cs.Users--
			}
		}
	}
	mutex.Unlock()
}

// Shutdown is called when the plugin is unloaded
func Shutdown() error {
	close(stopChan)
	return nil
}
