package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	baseCtx = context.Background()
)

// Ctx returns a base context used for shutdown paths.
func Ctx() context.Context {
	return baseCtx
}

// Connect returns a mongo client and database handle.
func Connect(uri string) (*mongo.Client, *mongo.Database, error) {
	ctx, cancel := context.WithTimeout(baseCtx, 30*time.Second)
	defer cancel()

	// Configure client options with TLS
	clientOptions := options.Client().ApplyURI(uri)
	
	// Explicitly set TLS configuration for MongoDB Atlas
	// MongoDB Atlas requires TLS, so we ensure it's enabled
	clientOptions.SetTLSConfig(nil) // nil means use default TLS config
	
	// Increase timeout for initial connection
	clientOptions.SetServerSelectionTimeout(30 * time.Second)
	clientOptions.SetSocketTimeout(30 * time.Second)
	clientOptions.SetConnectTimeout(30 * time.Second)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, nil, err
	}

	// Ping with longer timeout
	pingCtx, pingCancel := context.WithTimeout(baseCtx, 30*time.Second)
	defer pingCancel()
	
	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, nil, err
	}

	return client, client.Database("rizeos"), nil
}
