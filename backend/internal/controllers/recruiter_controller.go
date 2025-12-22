package controllers

import (
	"context"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// RecruiterController handles recruiter-specific analytics and AI features.
type RecruiterController struct {
	UserService *services.UserService
	JobService  *services.JobService
	AIService   *services.AIService
}

// SkillCount represents a skill with its frequency count.
type SkillCount struct {
	Skill string `json:"skill"`
	Count int    `json:"count"`
}

// JobCandidateCount represents a job with matching candidate count.
type JobCandidateCount struct {
	JobTitle string `json:"jobTitle"`
	Count    int    `json:"count"`
}

// JobSuggestion represents an AI-generated job suggestion.
type JobSuggestion struct {
	Title       string   `json:"title"`
	Skills      []string `json:"skills"`
	Description string   `json:"description"`
	Reason      string   `json:"reason"`
}

// GetSkillsAnalytics returns aggregated skill frequency across all job seekers.
func (r *RecruiterController) GetSkillsAnalytics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 15*time.Second)
	defer cancel()

	// Fetch all job seekers
	seekers, err := r.UserService.Search(ctx, models.RoleSeeker, "", nil)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "failed to fetch job seekers: "+err.Error())
		return
	}

	// Aggregate skills
	skillMap := make(map[string]int)
	for _, seeker := range seekers {
		for _, skill := range seeker.Skills {
			if skill != "" {
				skill = strings.TrimSpace(skill)
				// Normalize skill name (capitalize first letter)
				if len(skill) > 0 {
					// Handle multi-word skills (e.g., "Spring Boot")
					words := strings.Fields(skill)
					normalizedWords := make([]string, len(words))
					for i, word := range words {
						if len(word) > 0 {
							normalizedWords[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
						}
					}
					skill = strings.Join(normalizedWords, " ")
				}
				skillMap[skill]++
			}
		}
	}

	// Convert to slice and sort by count (descending)
	var results []SkillCount
	for skill, count := range skillMap {
		results = append(results, SkillCount{Skill: skill, Count: count})
	}

	// Sort by count descending
	sort.Slice(results, func(i, j int) bool {
		return results[i].Count > results[j].Count
	})

	// Limit to top 20
	if len(results) > 20 {
		results = results[:20]
	}

	utils.JSON(c, http.StatusOK, results)
}

// GetJobsAnalytics returns job availability vs candidate supply for recruiter's jobs.
func (r *RecruiterController) GetJobsAnalytics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	// Fetch recruiter's jobs
	jobs, err := r.JobService.List(ctx, bson.M{"recruiter_id": recruiterOID})
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "failed to fetch jobs: "+err.Error())
		return
	}

	// Fetch all job seekers
	seekers, err := r.UserService.Search(ctx, models.RoleSeeker, "", nil)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "failed to fetch job seekers: "+err.Error())
		return
	}

	// For each job, count matching candidates (fitment score >= 50%)
	threshold := 50.0
	var results []JobCandidateCount

	for _, job := range jobs {
		matchCount := 0

		// Calculate fitment score for each seeker
		for _, seeker := range seekers {
			// Use bio or summary for candidate bio
			candidateBio := seeker.Bio
			if seeker.Summary != "" {
				candidateBio = seeker.Summary
			}
			if candidateBio == "" {
				candidateBio = seeker.Name // Fallback
			}

			// Calculate match score with skills
			score, err := r.AIService.MatchScoreWithSkills(ctx, job.Description, candidateBio, job.Skills, seeker.Skills)
			if err != nil {
				continue
			}

			// Clamp score to 0-100
			if score < 0 {
				score = 0
			}
			if score > 100 {
				score = 100
			}

			// Count if score >= threshold
			if score >= threshold {
				matchCount++
			}
		}

		results = append(results, JobCandidateCount{
			JobTitle: job.Title,
			Count:    matchCount,
		})
	}

	// Sort by count descending
	sort.Slice(results, func(i, j int) bool {
		return results[i].Count > results[j].Count
	})

	utils.JSON(c, http.StatusOK, results)
}

// GetAISuggestions returns AI-powered job posting suggestions.
func (r *RecruiterController) GetAISuggestions(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	// Fetch all job seekers to analyze skill frequency
	seekers, err := r.UserService.Search(ctx, models.RoleSeeker, "", nil)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "failed to fetch job seekers: "+err.Error())
		return
	}

	// Aggregate skills with frequency
	skillMap := make(map[string]int)
	for _, seeker := range seekers {
		for _, skill := range seeker.Skills {
			if skill != "" {
				skill = strings.TrimSpace(skill)
				skillMap[strings.ToLower(skill)]++
			}
		}
	}

	// Get top skills
	type skillFreq struct {
		skill string
		count int
	}
	var skillFreqs []skillFreq
	for skill, count := range skillMap {
		skillFreqs = append(skillFreqs, skillFreq{skill: skill, count: count})
	}
	sort.Slice(skillFreqs, func(i, j int) bool {
		return skillFreqs[i].count > skillFreqs[j].count
	})

	// Fetch recruiter's existing jobs to avoid duplicates
	existingJobs, _ := r.JobService.List(ctx, bson.M{"recruiter_id": recruiterOID})
	existingSkillsSet := make(map[string]bool)
	for _, job := range existingJobs {
		for _, skill := range job.Skills {
			existingSkillsSet[strings.ToLower(skill)] = true
		}
	}

	// Generate suggestions based on top skill combinations
	var suggestions []JobSuggestion

	// Helper function to capitalize first letter
	capitalize := func(s string) string {
		if len(s) == 0 {
			return s
		}
		return strings.ToUpper(s[:1]) + strings.ToLower(s[1:])
	}

	// Suggestion 1: Top 3 skills combination
	if len(skillFreqs) >= 3 {
		topSkills := []string{
			capitalize(skillFreqs[0].skill),
			capitalize(skillFreqs[1].skill),
			capitalize(skillFreqs[2].skill),
		}
		
		// Determine job title based on skills
		title := r.inferJobTitle(topSkills)
		
		suggestions = append(suggestions, JobSuggestion{
			Title:       title,
			Skills:      topSkills,
			Description: r.generateJobDescription(title, topSkills),
			Reason:      "High availability of matching candidates",
		})
	}

	// Suggestion 2: Next top 3 skills (if available)
	if len(skillFreqs) >= 6 {
		nextSkills := []string{
			capitalize(skillFreqs[3].skill),
			capitalize(skillFreqs[4].skill),
			capitalize(skillFreqs[5].skill),
		}
		title := r.inferJobTitle(nextSkills)
		
		suggestions = append(suggestions, JobSuggestion{
			Title:       title,
			Skills:      nextSkills,
			Description: r.generateJobDescription(title, nextSkills),
			Reason:      "Strong candidate pool with these skills",
		})
	}

	// Suggestion 3: Popular skill combination (if different from above)
	if len(skillFreqs) >= 4 {
		// Try to find a combination that's not already suggested
		comboSkills := []string{
			capitalize(skillFreqs[0].skill),
			capitalize(skillFreqs[2].skill),
			capitalize(skillFreqs[3].skill),
		}
		title := r.inferJobTitle(comboSkills)
		
		// Only add if different from previous suggestions
		if len(suggestions) < 2 || suggestions[1].Title != title {
			suggestions = append(suggestions, JobSuggestion{
				Title:       title,
				Skills:      comboSkills,
				Description: r.generateJobDescription(title, comboSkills),
				Reason:      "Optimal skill combination for market demand",
			})
		}
	}

	// Limit to 3 suggestions
	if len(suggestions) > 3 {
		suggestions = suggestions[:3]
	}

	utils.JSON(c, http.StatusOK, gin.H{"suggestions": suggestions})
}

// inferJobTitle determines job title based on skills.
func (r *RecruiterController) inferJobTitle(skills []string) string {
	skillsLower := make([]string, len(skills))
	for i, s := range skills {
		skillsLower[i] = strings.ToLower(s)
	}

	// Check for specific patterns
	hasReact := contains(skillsLower, "react")
	hasNode := contains(skillsLower, "node") || contains(skillsLower, "node.js")
	hasPython := contains(skillsLower, "python")
	hasJava := contains(skillsLower, "java")
	hasML := contains(skillsLower, "machine learning") || contains(skillsLower, "ml")
	hasSecurity := contains(skillsLower, "cyber security") || contains(skillsLower, "cybersecurity")

	if hasReact && hasNode {
		return "Full Stack Developer"
	}
	if hasReact {
		return "Frontend Developer"
	}
	if hasNode && !hasReact {
		return "Backend Developer"
	}
	if hasPython && hasML {
		return "AI/ML Engineer"
	}
	if hasJava {
		return "Java Developer"
	}
	if hasSecurity {
		return "Cyber Security Analyst"
	}
	if hasPython {
		return "Python Developer"
	}

	// Default based on first skill
	if len(skills) > 0 {
		return skills[0] + " Developer"
	}
	return "Software Developer"
}

// generateJobDescription creates a short job description.
func (r *RecruiterController) generateJobDescription(title string, skills []string) string {
	skillsStr := strings.Join(skills, ", ")
	return "We are looking for a " + title + " with expertise in " + skillsStr + ". Join our team and work on exciting projects."
}

// contains checks if a slice contains a string (case-insensitive).
func contains(slice []string, item string) bool {
	itemLower := strings.ToLower(item)
	for _, s := range slice {
		if strings.ToLower(s) == itemLower {
			return true
		}
	}
	return false
}

