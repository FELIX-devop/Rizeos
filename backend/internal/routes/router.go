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
	UserSvc              *services.UserService
	JobSvc               *services.JobService
	PaymentSvc           *services.PaymentService
	AISvc                *services.AIService
	MessageSvc           *services.MessageService
	AnnouncementSvc      *services.AnnouncementService
	JobApplicationSvc    *services.JobApplicationService
	UserCol              *mongo.Collection
	JobCol               *mongo.Collection
}

// DefaultDeps builds services from a mongo database.
func DefaultDeps(cfg config.Config, db *mongo.Database) Deps {
	return Deps{
		UserSvc:           services.NewUserService(db),
		JobSvc:            services.NewJobService(db),
		PaymentSvc:         services.NewPaymentService(db),
		AISvc:              services.NewAIService(cfg.AIServiceURL),
		MessageSvc:         services.NewMessageService(db),
		AnnouncementSvc:     services.NewAnnouncementService(db),
		JobApplicationSvc:   services.NewJobApplicationService(db),
		UserCol:            db.Collection("users"),
		JobCol:             db.Collection("jobs"),
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
	paymentCtrl := &controllers.PaymentController{Service: deps.PaymentSvc, UserService: deps.UserSvc, Cfg: cfg}
	adminCtrl := &controllers.AdminController{PaymentService: deps.PaymentSvc, UserService: deps.UserSvc, JobService: deps.JobSvc, UserCol: deps.UserCol, JobCol: deps.JobCol}
	configCtrl := &controllers.ConfigController{Cfg: cfg}
	userCtrl := &controllers.UserController{UserService: deps.UserSvc}
	aiCtrl := &controllers.AIController{JobService: deps.JobSvc, UserService: deps.UserSvc, AIService: deps.AISvc}
	messageCtrl := &controllers.MessageController{MessageService: deps.MessageSvc, UserService: deps.UserSvc, JobService: deps.JobSvc}
	announcementCtrl := &controllers.AnnouncementController{AnnouncementService: deps.AnnouncementSvc, UserService: deps.UserSvc, MessageService: deps.MessageSvc}
	recruiterCtrl := &controllers.RecruiterController{UserService: deps.UserSvc, JobService: deps.JobSvc, AIService: deps.AISvc}
	jobApplicationCtrl := &controllers.JobApplicationController{
		JobApplicationService: deps.JobApplicationSvc,
		JobService:            deps.JobSvc,
		UserService:           deps.UserSvc,
		AIService:             deps.AISvc,
	}

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
		auth.POST("/payments/verify-jobseeker-premium", middleware.SeekerOnly(), paymentCtrl.VerifyJobSeekerPremium)
		auth.GET("/payments", paymentCtrl.List)

		auth.POST("/jobs", middleware.RecruiterOnly(), jobCtrl.Create)
		auth.POST("/jobs/:id/apply", middleware.SeekerOnly(), jobCtrl.Apply) // Keep for backward compatibility
		auth.POST("/job-applications/apply", middleware.SeekerOnly(), jobApplicationCtrl.Apply)
		auth.GET("/ai/match-score", aiCtrl.MatchScore)
		auth.POST("/ai/extract-skills", aiCtrl.ExtractSkills)
		auth.GET("/ai/recommend/jobs", aiCtrl.RecommendJobs)
		auth.GET("/ai/recommend/candidates", aiCtrl.RecommendCandidates)

		// Messages: Any role can send messages (with role validation)
		auth.POST("/messages/send", messageCtrl.Send)
	}

	router.GET("/api/jobs", middleware.OptionalAuth(cfg), jobCtrl.List)
	router.GET("/api/jobs/:id", middleware.OptionalAuth(cfg), jobCtrl.GetJobProfile)

	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(cfg), middleware.AdminOnly())
	admin.GET("/dashboard", adminCtrl.Dashboard)
	admin.GET("/users/:userId", adminCtrl.GetUserProfile)
	admin.GET("/jobs/:jobId", adminCtrl.GetJobProfile)
	admin.GET("/messages/inbox", messageCtrl.AdminInbox)
	admin.GET("/messages/unread-count", messageCtrl.GetUnreadCount)
	admin.PUT("/messages/:id/read", messageCtrl.MarkAsRead)
	admin.POST("/announcements", announcementCtrl.CreateAnnouncement)

	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware(cfg))
	{
		api.GET("/users", userCtrl.List) // filtered user list (e.g., seekers)
		api.GET("/users/:userId", userCtrl.GetUserProfilePublic) // public user profile (for job seekers viewing recruiters)

		// Recruiter job ranking
		api.GET("/recruiter/jobs/:jobId/ranked-jobseekers", middleware.RecruiterOnly(), jobCtrl.GetRankedJobSeekers)

		// Recruiter analytics
		api.GET("/recruiter/analytics/skills", middleware.RecruiterOnly(), recruiterCtrl.GetSkillsAnalytics)
		api.GET("/recruiter/analytics/jobs", middleware.RecruiterOnly(), recruiterCtrl.GetJobsAnalytics)

		// Recruiter AI suggestions
		api.GET("/recruiter/jobs/ai-suggestions", middleware.RecruiterOnly(), recruiterCtrl.GetAISuggestions)

		// Recruiter job applicants
		api.GET("/recruiter/jobs/:jobId/applicants", middleware.RecruiterOnly(), jobApplicationCtrl.GetApplicants)

		// Messages: Recruiter inbox for seeker messages
		api.GET("/messages/recruiter/inbox", middleware.RecruiterOnly(), messageCtrl.RecruiterInbox)
		api.GET("/messages/recruiter/unread-count", middleware.RecruiterOnly(), messageCtrl.GetRecruiterUnreadCount)
		
		// Messages: Job seeker inbox
		api.GET("/messages/seeker/inbox", middleware.SeekerOnly(), messageCtrl.SeekerInbox)
		api.GET("/messages/seeker/unread-count", middleware.SeekerOnly(), messageCtrl.GetSeekerUnreadCount)
		
		api.PUT("/messages/:id/read", messageCtrl.MarkAsRead) // Shared endpoint for all roles

		// Announcements: Available to recruiters and job seekers
		api.GET("/announcements", announcementCtrl.ListAnnouncements)
		
		// Job seeker premium status
		api.GET("/jobseeker/premium-status", middleware.SeekerOnly(), userCtrl.GetPremiumStatus)
	}

	return router
}
