package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"rizeos/backend/internal/config"
	"rizeos/backend/internal/routes"
	"rizeos/backend/internal/services"
)

type apiResponse struct {
	Data json.RawMessage `json:"data"`
}

// helper to perform HTTP requests with optional token.
func performRequest(r http.Handler, method, path, body, token string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// buildTestRouter uses in-memory services.
func buildTestRouter() (*gin.Engine, config.Config) {
	cfg := config.Config{
		JWTSecret:         "testsecret",
		AdminWallet:       "0xadminwallet",
		PolygonRPCURL:     "https://example-rpc",
		PlatformFeeMatic:  0.1,
		AllowedOriginsCSV: "*",
		AdminSignupCode:   "owner-secret",
	}
	deps := routes.Deps{
		UserSvc:    services.NewUserService(nil),
		JobSvc:     services.NewJobService(nil),
		PaymentSvc: services.NewPaymentService(nil),
		AISvc:      services.NewAIService("http://localhost:8000"),
	}
	return routes.SetupRouterWithDeps(cfg, deps), cfg
}

func TestAuthAndProtectedRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router, cfg := buildTestRouter()

	// Register recruiter
	registerBody := `{"name":"Rec","email":"rec@test.com","password":"password123","role":"recruiter"}`
	res := performRequest(router, http.MethodPost, "/api/auth/register", registerBody, "")
	if res.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", res.Code)
	}

	var resp apiResponse
	if err := json.Unmarshal(res.Body.Bytes(), &resp); err != nil {
		t.Fatal(err)
	}
	var registerData struct {
		Token string `json:"token"`
	}
	_ = json.Unmarshal(resp.Data, &registerData)
	if registerData.Token == "" {
		t.Fatal("token missing")
	}

	// Access protected me
	meRes := performRequest(router, http.MethodGet, "/api/auth/me", "", registerData.Token)
	if meRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", meRes.Code)
	}

	// Verify payment
	verifyBody := `{"tx_hash":"0xtesthash"}`
	payRes := performRequest(router, http.MethodPost, "/api/payments/verify", verifyBody, registerData.Token)
	if payRes.Code != http.StatusCreated {
		t.Fatalf("expected payment verify 201, got %d", payRes.Code)
	}

	var payResp apiResponse
	_ = json.Unmarshal(payRes.Body.Bytes(), &payResp)
	var paymentData map[string]interface{}
	_ = json.Unmarshal(payResp.Data, &paymentData)
	paymentID, ok := paymentData["id"].(string)
	if !ok || paymentID == "" {
		t.Fatalf("payment id missing: %+v", paymentData)
	}

	// Create job
	jobBody := `{"title":"Backend","description":"Go dev","skills":["Go"],"location":"Remote","payment_id":"` + paymentID + `"}`
	jobRes := performRequest(router, http.MethodPost, "/api/jobs", jobBody, registerData.Token)
	if jobRes.Code != http.StatusCreated {
		t.Fatalf("expected job create 201, got %d", jobRes.Code)
	}

	// List jobs
	listRes := performRequest(router, http.MethodGet, "/api/jobs", "", "")
	if listRes.Code != http.StatusOK {
		t.Fatalf("expected job list 200, got %d", listRes.Code)
	}

	// Admin dashboard should fail for recruiter
	adminRes := performRequest(router, http.MethodGet, "/api/admin/dashboard", "", registerData.Token)
	if adminRes.Code != http.StatusForbidden && adminRes.Code != http.StatusUnauthorized {
		t.Fatalf("expected admin guard, got %d", adminRes.Code)
	}

	// Ensure JWT secret used
	if cfg.JWTSecret == "" {
		t.Fatal("config jwt secret missing")
	}
}
