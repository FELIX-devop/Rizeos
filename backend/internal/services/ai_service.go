package services

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
)

// AIService communicates with the FastAPI AI microservice.
type AIService struct {
	BaseURL string
	Client  *http.Client
}

// NewAIService creates an AIService.
func NewAIService(baseURL string) *AIService {
	return &AIService{
		BaseURL: baseURL,
		Client:  &http.Client{},
	}
}

// ExtractSkills calls the AI microservice to extract skills from text.
func (s *AIService) ExtractSkills(ctx context.Context, text string) ([]string, error) {
	payload := map[string]string{"text": text}
	var out map[string]interface{}
	if err := s.do(ctx, "/skills/extract", payload, &out); err != nil {
		return nil, err
	}
	if skills, ok := out["skills"].([]interface{}); ok {
		return toStringSlice(skills), nil
	}
	if data, ok := out["data"].(map[string]interface{}); ok {
		if skills, ok := data["skills"].([]interface{}); ok {
			return toStringSlice(skills), nil
		}
	}
	return []string{}, nil
}

// MatchScore returns similarity percentage.
func (s *AIService) MatchScore(ctx context.Context, jobDesc, candidateBio string) (float64, error) {
	payload := map[string]string{"job_description": jobDesc, "candidate_bio": candidateBio}
	var out map[string]interface{}
	if err := s.do(ctx, "/match", payload, &out); err != nil {
		return 0, err
	}
	if score, ok := out["score"].(float64); ok {
		return score, nil
	}
	if data, ok := out["data"].(map[string]interface{}); ok {
		if score, ok := data["score"].(float64); ok {
			return score, nil
		}
	}
	return 0, nil
}

// Recommendations returns smart suggestions.
func (s *AIService) Recommendations(ctx context.Context, role string, payload map[string]interface{}) (map[string]interface{}, error) {
	var out map[string]interface{}
	if err := s.do(ctx, "/recommendations/"+role, payload, &out); err != nil {
		return nil, err
	}
	if data, ok := out["data"].(map[string]interface{}); ok {
		return data, nil
	}
	return out, nil
}

func (s *AIService) do(ctx context.Context, path string, body interface{}, out interface{}) error {
	b, err := json.Marshal(body)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.BaseURL+path, bytes.NewBuffer(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return json.NewDecoder(resp.Body).Decode(out)
}

func toStringSlice(in []interface{}) []string {
	res := make([]string, 0, len(in))
	for _, v := range in {
		if str, ok := v.(string); ok {
			res = append(res, str)
		}
	}
	return res
}
