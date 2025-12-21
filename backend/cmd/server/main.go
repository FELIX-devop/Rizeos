package main

import (
	"log"

	"rizeos/backend/internal/config"
	"rizeos/backend/internal/database"
	"rizeos/backend/internal/routes"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	client, db, err := database.Connect(cfg.MongoURI)
	if err != nil {
		log.Fatalf("failed to connect to mongo: %v", err)
	}
	defer client.Disconnect(database.Ctx())

	router := routes.SetupRouter(cfg, db)

	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
