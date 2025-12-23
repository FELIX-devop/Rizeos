package utils

import (
	"math"
	"strings"
)

// CalculateRecruiterRankScore calculates a rule-based skill match score
// for recruiter ranking. This is separate from AI-based fitment scores.
//
// Rule:
// - Compare required skills with candidate skills
// - Calculate overlap percentage
// - Add small bonus if all required skills match
//
// Returns: score 0-100 (rounded to 1 decimal place)
func CalculateRecruiterRankScore(required []string, candidate []string) float64 {
	// Normalize candidate skills to lowercase set for fast lookup
	skillSet := make(map[string]bool)
	for _, s := range candidate {
		normalized := strings.ToLower(strings.TrimSpace(s))
		if normalized != "" {
			skillSet[normalized] = true
		}
	}

	// Count matched required skills
	matched := 0
	for _, r := range required {
		normalized := strings.ToLower(strings.TrimSpace(r))
		if normalized != "" && skillSet[normalized] {
			matched++
		}
	}

	// If no required skills, return 0
	if len(required) == 0 {
		return 0
	}

	// Calculate base score as percentage of matched skills
	score := (float64(matched) / float64(len(required))) * 100

	// Small bonus if all required skills match (perfect match)
	if matched == len(required) && matched > 0 {
		score += 5
	}

	// Clamp to 100 max
	if score > 100 {
		score = 100
	}

	// Round to 1 decimal place
	return math.Round(score*10) / 10
}

