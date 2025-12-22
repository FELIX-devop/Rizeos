package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"rizeos/backend/internal/models"
)

type PaymentService struct {
	col *mongo.Collection
}

var paymentMemory = struct {
	sync.Mutex
	data map[string]models.Payment
}{data: map[string]models.Payment{}}

// NewPaymentService creates the payment service.
func NewPaymentService(db *mongo.Database) *PaymentService {
	if db == nil {
		return &PaymentService{col: nil}
	}
	return &PaymentService{col: db.Collection("payments")}
}

// VerifyAndStore verifies a Sepolia tx via JSON-RPC and stores it.
func (s *PaymentService) VerifyAndStore(ctx context.Context, rpcURL, adminWallet, txHash string, minAmount float64) (models.Payment, error) {
	if s.col == nil {
		// In-memory happy-path mock for tests.
		payment := models.Payment{
			ID:          primitive.NewObjectID(),
			TxHash:      txHash,
			Amount:      minAmount,
			Recipient:   adminWallet,
			Network:     "sepolia",
			Status:      "verified",
			Consumed:    false,
			PaymentType: "JOB_POSTING", // default for recruiter payments
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		paymentMemory.Lock()
		paymentMemory.data[payment.ID.Hex()] = payment
		paymentMemory.Unlock()
		return payment, nil
	}
	adminWallet = strings.ToLower(adminWallet)
	tx, err := fetchTx(rpcURL, txHash)
	if err != nil {
		return models.Payment{}, err
	}
	if tx.To == "" || strings.ToLower(tx.To) != adminWallet {
		return models.Payment{}, errors.New("payment recipient mismatch")
	}

	valueEth, err := hexWeiToEth(tx.Value)
	if err != nil {
		return models.Payment{}, err
	}
	if valueEth < minAmount {
		return models.Payment{}, errors.New("insufficient fee amount")
	}

	receipt, err := fetchReceipt(rpcURL, txHash)
	if err != nil {
		return models.Payment{}, err
	}
	if receipt.Status != "0x1" {
		return models.Payment{}, errors.New("transaction not confirmed")
	}

	payment := models.Payment{
		TxHash:      txHash,
		Amount:      valueEth,
		Recipient:   tx.To,
		Network:     "sepolia",
		Status:      "verified",
		Consumed:    false,
		PaymentType: "JOB_POSTING", // default for recruiter payments
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	res, err := s.col.InsertOne(ctx, payment)
	if err != nil {
		return models.Payment{}, err
	}
	payment.ID = res.InsertedID.(primitive.ObjectID)
	return payment, nil
}

// AttachRecruiter tags the payment with recruiter ownership.
func (s *PaymentService) AttachRecruiter(ctx context.Context, paymentID primitive.ObjectID, recruiterID primitive.ObjectID) error {
	if s.col == nil {
		paymentMemory.Lock()
		defer paymentMemory.Unlock()
		p, ok := paymentMemory.data[paymentID.Hex()]
		if !ok {
			return mongo.ErrNoDocuments
		}
		p.RecruiterID = &recruiterID
		paymentMemory.data[paymentID.Hex()] = p
		return nil
	}
	_, err := s.col.UpdateByID(ctx, paymentID, bson.M{"$set": bson.M{"recruiter_id": recruiterID, "updated_at": time.Now()}})
	return err
}

// AttachJobSeeker tags the payment with job seeker ownership for premium payments.
func (s *PaymentService) AttachJobSeeker(ctx context.Context, paymentID primitive.ObjectID, jobSeekerID primitive.ObjectID) error {
	if s.col == nil {
		paymentMemory.Lock()
		defer paymentMemory.Unlock()
		p, ok := paymentMemory.data[paymentID.Hex()]
		if !ok {
			return mongo.ErrNoDocuments
		}
		p.JobSeekerID = &jobSeekerID
		p.PaymentType = "JOB_SEEKER_PREMIUM"
		p.Consumed = true // Premium payments are consumed immediately
		paymentMemory.data[paymentID.Hex()] = p
		return nil
	}
	_, err := s.col.UpdateByID(ctx, paymentID, bson.M{
		"$set": bson.M{
			"job_seeker_id": jobSeekerID,
			"payment_type":  "JOB_SEEKER_PREMIUM",
			"consumed":      true,
			"updated_at":    time.Now(),
		},
	})
	return err
}

// MarkConsumed associates the payment to a job.
func (s *PaymentService) MarkConsumed(ctx context.Context, paymentID primitive.ObjectID, jobID primitive.ObjectID) error {
	if s.col == nil {
		paymentMemory.Lock()
		defer paymentMemory.Unlock()
		p, ok := paymentMemory.data[paymentID.Hex()]
		if !ok {
			return mongo.ErrNoDocuments
		}
		p.Consumed = true
		p.JobID = &jobID
		paymentMemory.data[paymentID.Hex()] = p
		return nil
	}
	_, err := s.col.UpdateByID(ctx, paymentID, bson.M{"$set": bson.M{"consumed": true, "job_id": jobID, "updated_at": time.Now()}})
	return err
}

// FindByID returns a payment.
func (s *PaymentService) FindByID(ctx context.Context, id primitive.ObjectID) (models.Payment, error) {
	if s.col == nil {
		paymentMemory.Lock()
		defer paymentMemory.Unlock()
		if p, ok := paymentMemory.data[id.Hex()]; ok {
			return p, nil
		}
		return models.Payment{}, mongo.ErrNoDocuments
	}
	var p models.Payment
	if err := s.col.FindOne(ctx, bson.M{"_id": id}).Decode(&p); err != nil {
		return models.Payment{}, err
	}
	return p, nil
}

// List returns payments optionally filtered.
func (s *PaymentService) List(ctx context.Context, filter bson.M) ([]models.Payment, error) {
	if s.col == nil {
		paymentMemory.Lock()
		defer paymentMemory.Unlock()
		items := make([]models.Payment, 0, len(paymentMemory.data))
		for _, p := range paymentMemory.data {
			if recruiterID, ok := filter["recruiter_id"].(primitive.ObjectID); ok {
				if p.RecruiterID == nil || *p.RecruiterID != recruiterID {
					continue
				}
			}
			items = append(items, p)
		}
		return items, nil
	}
	cur, err := s.col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var items []models.Payment
	if err := cur.All(ctx, &items); err != nil {
		return nil, err
	}
	return items, nil
}

type rpcRequest struct {
	Jsonrpc string        `json:"jsonrpc"`
	Method  string        `json:"method"`
	Params  []interface{} `json:"params"`
	ID      int           `json:"id"`
}

type rpcResponse struct {
	Result json.RawMessage `json:"result"`
	Error  *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type txResult struct {
	Hash  string `json:"hash"`
	To    string `json:"to"`
	Value string `json:"value"`
	From  string `json:"from"`
}

type receiptResult struct {
	Status string `json:"status"`
}

func fetchTx(rpcURL, txHash string) (txResult, error) {
	payload := rpcRequest{Jsonrpc: "2.0", Method: "eth_getTransactionByHash", Params: []interface{}{txHash}, ID: 1}
	body, _ := json.Marshal(payload)
	resp, err := http.Post(rpcURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return txResult{}, err
	}
	defer resp.Body.Close()

	var result rpcResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return txResult{}, err
	}
	if result.Error != nil {
		return txResult{}, errors.New(result.Error.Message)
	}
	var tx txResult
	if err := json.Unmarshal(result.Result, &tx); err != nil {
		return txResult{}, err
	}
	return tx, nil
}

func fetchReceipt(rpcURL, txHash string) (receiptResult, error) {
	payload := rpcRequest{Jsonrpc: "2.0", Method: "eth_getTransactionReceipt", Params: []interface{}{txHash}, ID: 1}
	body, _ := json.Marshal(payload)
	resp, err := http.Post(rpcURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return receiptResult{}, err
	}
	defer resp.Body.Close()
	var result rpcResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return receiptResult{}, err
	}
	if result.Error != nil {
		return receiptResult{}, errors.New(result.Error.Message)
	}
	var receipt receiptResult
	if err := json.Unmarshal(result.Result, &receipt); err != nil {
		return receiptResult{}, err
	}
	return receipt, nil
}

func hexWeiToEth(hexVal string) (float64, error) {
	if strings.HasPrefix(hexVal, "0x") {
		hexVal = strings.TrimPrefix(hexVal, "0x")
	}
	weiInt, ok := new(big.Int).SetString(hexVal, 16)
	if !ok {
		return 0, strconv.ErrSyntax
	}
	// Convert to float for display/threshold; for money-critical paths, prefer big.Rat.
	f, _ := new(big.Rat).SetFrac(weiInt, big.NewInt(1e18)).Float64()
	return f, nil
}
