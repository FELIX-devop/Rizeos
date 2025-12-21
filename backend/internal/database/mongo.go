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
	ctx, cancel := context.WithTimeout(baseCtx, 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, nil, err
	}

	return client, client.Database("rizeos"), nil
}
