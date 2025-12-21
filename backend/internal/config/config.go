package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds runtime configuration for the backend.
type Config struct {
	Port              string
	MongoURI          string
	JWTSecret         string
	AdminWallet       string
	AIServiceURL      string
	PolygonRPCURL     string
	PlatformFeeMatic  float64
	AllowedOriginsCSV string
	AdminSignupCode   string
}

// Load reads environment variables and returns a Config.
func Load() (Config, error) {
	_ = godotenv.Load()

	return Config{
		Port:              getEnv("PORT", "8080"),
		MongoURI:          getEnv("MONGO_URI", "mongodb://localhost:27017/rizeos"),
		JWTSecret:         getEnv("JWT_SECRET", "change_me"),
		AdminWallet:       getEnv("ADMIN_WALLET_ADDRESS", ""),
		AIServiceURL:      getEnv("AI_SERVICE_URL", "http://localhost:8000"),
		PolygonRPCURL:     getEnv("POLYGON_RPC_URL", ""),
		PlatformFeeMatic:  getEnvAsFloat("PLATFORM_FEE_MATIC", 0.1),
		AllowedOriginsCSV: getEnv("CORS_ALLOWED_ORIGINS", "*"),
		AdminSignupCode:   getEnv("ADMIN_SIGNUP_CODE", "owner-secret"),
	}, nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvAsFloat(key string, fallback float64) float64 {
	if val := os.Getenv(key); val != "" {
		if f, err := parseFloat(val); err == nil {
			return f
		}
	}
	return fallback
}

func parseFloat(val string) (float64, error) {
	return strconv.ParseFloat(val, 64)
}
