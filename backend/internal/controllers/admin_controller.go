package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// AdminController returns aggregated analytics.
type AdminController struct {
	PaymentService *services.PaymentService
	UserCol        *mongo.Collection
	JobCol         *mongo.Collection
}

// Dashboard returns payment totals and counts.
func (a *AdminController) Dashboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	payments, err := a.PaymentService.List(ctx, bson.M{"status": "verified"})
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}
	total := 0.0
	for _, p := range payments {
		total += p.Amount
	}

	var users []map[string]interface{}
	cursor, err := a.UserCol.Find(ctx, bson.M{})
	if err == nil {
		defer cursor.Close(ctx)
		for cursor.Next(ctx) {
			var u bson.M
			if err := cursor.Decode(&u); err == nil {
				delete(u, "password_hash")
				users = append(users, u)
			}
		}
	}

	var jobs []bson.M
	jobCur, err := a.JobCol.Find(ctx, bson.M{})
	if err == nil {
		defer jobCur.Close(ctx)
		_ = jobCur.All(ctx, &jobs)
	}

	userCount, _ := a.UserCol.CountDocuments(ctx, bson.M{})
	jobCount, _ := a.JobCol.CountDocuments(ctx, bson.M{})

	utils.JSON(c, http.StatusOK, gin.H{
		"total_payments_matic": total,
		"payments":             payments,
		"users":                userCount,
		"jobs":                 jobCount,
		"user_list":            users,
		"job_list":             jobs,
	})
}
