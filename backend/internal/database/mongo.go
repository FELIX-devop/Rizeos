package database

import (
	"context"
	"crypto/tls"
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

	// Configure client options
	clientOptions := options.Client().ApplyURI(uri)
	
	// Explicitly configure TLS for MongoDB Atlas
	// mongodb+srv:// automatically uses TLS, but we configure it explicitly
	tlsConfig := &tls.Config{
		InsecureSkipVerify: false, // Verify server certificates
	}
	clientOptions.SetTLSConfig(tlsConfig)
	
	// Increase timeouts for initial connection
	clientOptions.SetServerSelectionTimeout(30 * time.Second)
	clientOptions.SetSocketTimeout(30 * time.Second)
	clientOptions.SetConnectTimeout(30 * time.Second)
	
	// Set retry options
	clientOptions.SetRetryWrites(true)
	clientOptions.SetRetryReads(true)
	
	// Set heartbeat interval
	clientOptions.SetHeartbeatInterval(10 * time.Second)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, nil, err
	}

	// Ping with longer timeout to verify connection
	pingCtx, pingCancel := context.WithTimeout(baseCtx, 30*time.Second)
	defer pingCancel()
	
	if err := client.Ping(pingCtx, nil); err != nil {
		// Disconnect on ping failure
		_ = client.Disconnect(ctx)
		return nil, nil, err
	}

	return client, client.Database("rizeos"), nil
}
