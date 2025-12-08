package main

import (
	"encoding/json"
	"net"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
)

// Plugin metadata - must match plugin.json
var PluginInfo = struct {
	ID      string
	Name    string
	Version string
}{
	ID:      "geoip-display",
	Name:    "GeoIP Display",
	Version: "1.0.0",
}

// Config holds plugin configuration
type Config struct {
	GeoIPDatabase string `json:"geoip_database"`
	ShowCity      bool   `json:"show_city"`
	ShowRegion    bool   `json:"show_region"`
}

// GeoLocation represents geographic data for an IP
type GeoLocation struct {
	IP          string  `json:"ip"`
	CountryCode string  `json:"country_code"`
	CountryName string  `json:"country_name"`
	Region      string  `json:"region,omitempty"`
	City        string  `json:"city,omitempty"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	ISP         string  `json:"isp,omitempty"`
}

var (
	config     Config
	geoCache   = make(map[string]*GeoLocation)
	cacheMutex sync.RWMutex
)

// Initialize is called when the plugin is loaded
func Initialize(cfg json.RawMessage) error {
	// Parse configuration
	config = Config{
		GeoIPDatabase: "/usr/share/GeoIP/GeoLite2-City.mmdb",
		ShowCity:      true,
		ShowRegion:    true,
	}

	if len(cfg) > 0 {
		if err := json.Unmarshal(cfg, &config); err != nil {
			return err
		}
	}

	return nil
}

// RegisterRoutes registers plugin API endpoints
func RegisterRoutes(router *gin.RouterGroup) {
	router.GET("/geoip/:ip", handleGeoLookup)
	router.GET("/geoip/users", handleUserGeoData)
	router.POST("/geoip/batch", handleBatchLookup)
}

// handleGeoLookup returns geo data for a single IP
func handleGeoLookup(c *gin.Context) {
	ip := c.Param("ip")

	// Validate IP
	if net.ParseIP(ip) == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid IP address"})
		return
	}

	// Check cache
	cacheMutex.RLock()
	if cached, ok := geoCache[ip]; ok {
		cacheMutex.RUnlock()
		c.JSON(http.StatusOK, cached)
		return
	}
	cacheMutex.RUnlock()

	// Look up geo data
	geo := lookupIP(ip)

	// Cache the result
	cacheMutex.Lock()
	geoCache[ip] = geo
	cacheMutex.Unlock()

	c.JSON(http.StatusOK, geo)
}

// handleUserGeoData returns geo data for all connected users
func handleUserGeoData(c *gin.Context) {
	// This would integrate with the main panel's user data
	// For now, return sample data showing the plugin structure
	c.JSON(http.StatusOK, gin.H{
		"message": "This endpoint provides geo data for connected users",
		"note":    "Integrate with panel user API to get real data",
	})
}

// handleBatchLookup handles batch IP lookups
func handleBatchLookup(c *gin.Context) {
	var request struct {
		IPs []string `json:"ips"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(request.IPs) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 100 IPs per request"})
		return
	}

	results := make(map[string]*GeoLocation)
	for _, ip := range request.IPs {
		if net.ParseIP(ip) != nil {
			results[ip] = lookupIP(ip)
		}
	}

	c.JSON(http.StatusOK, results)
}

// lookupIP performs the actual geo lookup
// In production, this would use a real GeoIP database
func lookupIP(ip string) *GeoLocation {
	// Check if it's a private/reserved IP
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return &GeoLocation{IP: ip}
	}

	if isPrivateIP(parsedIP) {
		return &GeoLocation{
			IP:          ip,
			CountryCode: "XX",
			CountryName: "Private Network",
		}
	}

	// For demo purposes, return sample data based on IP ranges
	// In production, use MaxMind GeoLite2 or similar
	geo := &GeoLocation{
		IP: ip,
	}

	// Simple demo logic - in real plugin, use actual GeoIP database
	firstOctet := parsedIP[0]
	if parsedIP.To4() != nil {
		firstOctet = parsedIP.To4()[0]
	}

	switch {
	case firstOctet < 50:
		geo.CountryCode = "US"
		geo.CountryName = "United States"
		geo.Region = "California"
		geo.City = "San Francisco"
		geo.Latitude = 37.7749
		geo.Longitude = -122.4194
	case firstOctet < 100:
		geo.CountryCode = "GB"
		geo.CountryName = "United Kingdom"
		geo.Region = "England"
		geo.City = "London"
		geo.Latitude = 51.5074
		geo.Longitude = -0.1278
	case firstOctet < 150:
		geo.CountryCode = "DE"
		geo.CountryName = "Germany"
		geo.Region = "Berlin"
		geo.City = "Berlin"
		geo.Latitude = 52.5200
		geo.Longitude = 13.4050
	default:
		geo.CountryCode = "JP"
		geo.CountryName = "Japan"
		geo.Region = "Tokyo"
		geo.City = "Tokyo"
		geo.Latitude = 35.6762
		geo.Longitude = 139.6503
	}

	return geo
}

func isPrivateIP(ip net.IP) bool {
	if ip4 := ip.To4(); ip4 != nil {
		return ip4[0] == 10 ||
			(ip4[0] == 172 && ip4[1] >= 16 && ip4[1] <= 31) ||
			(ip4[0] == 192 && ip4[1] == 168) ||
			ip4[0] == 127
	}
	return false
}

// OnUserConnect is called when a user connects
func OnUserConnect(userData map[string]interface{}) {
	// Extract IP and enrich with geo data
	if ip, ok := userData["ip"].(string); ok {
		geo := lookupIP(ip)

		// Cache for later use
		cacheMutex.Lock()
		geoCache[ip] = geo
		cacheMutex.Unlock()
	}
}

// Shutdown is called when the plugin is unloaded
func Shutdown() error {
	// Clear cache
	cacheMutex.Lock()
	geoCache = make(map[string]*GeoLocation)
	cacheMutex.Unlock()

	return nil
}
