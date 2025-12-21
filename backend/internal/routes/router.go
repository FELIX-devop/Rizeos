package routes

import (
	"net/http"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"rizeos/backend/internal/config"
	"rizeos/backend/internal/controllers"
	"rizeos/backend/internal/middleware"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// Deps holds service dependencies for easier testing.
type Deps struct {
	UserSvc    *services.UserService
	JobSvc     *services.JobService
	PaymentSvc *services.PaymentService
	AISvc      *services.AIService
	UserCol    *mongo.Collection
	JobCol     *mongo.Collection
}

// DefaultDeps builds services from a mongo database.
func DefaultDeps(cfg config.Config, db *mongo.Database) Deps {
	return Deps{
		UserSvc:    services.NewUserService(db),
		JobSvc:     services.NewJobService(db),
		PaymentSvc: services.NewPaymentService(db),
		AISvc:      services.NewAIService(cfg.AIServiceURL),
		UserCol:    db.Collection("users"),
		JobCol:     db.Collection("jobs"),
	}
}

// SetupRouter initializes the Gin engine with routes and middleware.
func SetupRouter(cfg config.Config, db *mongo.Database) *gin.Engine {
	return SetupRouterWithDeps(cfg, DefaultDeps(cfg, db))
}

// SetupRouterWithDeps allows injecting in-memory services for tests.
func SetupRouterWithDeps(cfg config.Config, deps Deps) *gin.Engine {
	router := gin.Default()
	corsCfg := cors.DefaultConfig()
	if cfg.AllowedOriginsCSV == "*" {
		corsCfg.AllowAllOrigins = true
	} else {
		corsCfg.AllowOrigins = strings.Split(cfg.AllowedOriginsCSV, ",")
	}
	corsCfg.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(corsCfg))

	authCtrl := &controllers.AuthController{UserService: deps.UserSvc, Cfg: cfg}
	profileCtrl := &controllers.ProfileController{UserService: deps.UserSvc, AIService: deps.AISvc}
	jobCtrl := &controllers.JobController{JobService: deps.JobSvc, PaymentService: deps.PaymentSvc, AIService: deps.AISvc, UserService: deps.UserSvc, PlatformFeeMatic: cfg.PlatformFeeMatic}
	paymentCtrl := &controllers.PaymentController{Service: deps.PaymentSvc, Cfg: cfg}
	adminCtrl := &controllers.AdminController{PaymentService: deps.PaymentSvc, UserCol: deps.UserCol, JobCol: deps.JobCol}
	configCtrl := &controllers.ConfigController{Cfg: cfg}
	userCtrl := &controllers.UserController{UserService: deps.UserSvc}
	aiCtrl := &controllers.AIController{JobService: deps.JobSvc, UserService: deps.UserSvc, AIService: deps.AISvc}

	router.GET("/api/health", func(c *gin.Context) { utils.JSON(c, http.StatusOK, gin.H{"status": "ok"}) })
	router.GET("/api/config/public", configCtrl.Public)

	router.POST("/api/auth/register", authCtrl.Register)
	router.POST("/api/auth/login", authCtrl.Login)

	auth := router.Group("/api")
	auth.Use(middleware.AuthMiddleware(cfg))
	{
		auth.GET("/auth/me", authCtrl.Current)
		auth.PUT("/profile", profileCtrl.Update)

		auth.POST("/payments/verify", middleware.RecruiterOnly(), paymentCtrl.Verify)
		auth.GET("/payments", paymentCtrl.List)

		auth.POST("/jobs", middleware.RecruiterOnly(), jobCtrl.Create)
		auth.POST("/jobs/:id/apply", middleware.SeekerOnly(), jobCtrl.Apply)
		auth.GET("/ai/match-score", aiCtrl.MatchScore)
		auth.POST("/ai/extract-skills", aiCtrl.ExtractSkills)
		auth.GET("/ai/recommend/jobs", aiCtrl.RecommendJobs)
		auth.GET("/ai/recommend/candidates", aiCtrl.RecommendCandidates)
	}

	router.GET("/api/jobs", middleware.OptionalAuth(cfg), jobCtrl.List)

	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(cfg), middleware.AdminOnly())
	admin.GET("/dashboard", adminCtrl.Dashboard)

	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware(cfg))
	{
		api.GET("/users", userCtrl.List) // filtered user list (e.g., seekers)
	}

	return router
}
