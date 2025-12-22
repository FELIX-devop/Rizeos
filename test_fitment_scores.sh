#!/bin/bash

# AI Job Fitment Score Validation Tests
# Tests all 5 scenarios to verify scores are between 0-100

AI_SERVICE_URL="http://localhost:8000"
ENDPOINT="/match"

echo "=========================================="
echo "AI Job Fitment Score Validation Tests"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test a scenario
test_scenario() {
    local scenario_name=$1
    local expected_min=$2
    local expected_max=$3
    local json_payload=$4
    
    echo "Testing: $scenario_name"
    echo "Expected Range: $expected_min - $expected_max"
    
    response=$(curl -s -X POST "$AI_SERVICE_URL$ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    echo "Response: $response"
    
    # Extract score using grep and cut
    score=$(echo "$response" | grep -o '"score":[0-9.]*' | cut -d':' -f2)
    
    if [ -z "$score" ]; then
        echo -e "${RED}✗ FAILED: Could not extract score from response${NC}"
        echo ""
        return 1
    fi
    
    # Check bounds (0-100) using awk for floating point comparison
    score_check=$(awk "BEGIN {print ($score >= 0 && $score <= 100) ? 1 : 0}")
    
    if [ "$score_check" -eq 0 ]; then
        echo -e "${RED}✗ FAILED: Score out of bounds (0-100): $score${NC}"
        echo ""
        return 1
    fi
    
    # Check if score is in expected range
    in_range=$(awk "BEGIN {print ($score >= $expected_min && $score <= $expected_max) ? 1 : 0}")
    
    if [ "$in_range" -eq 1 ]; then
        echo -e "${GREEN}✓ PASSED: Score = ${score}% (within expected range)${NC}"
    else
        echo -e "${YELLOW}⚠ WARNING: Score = ${score}% (outside expected range $expected_min-$expected_max, but within 0-100 bounds)${NC}"
    fi
    echo ""
}

echo "SCENARIO 1: PERFECT MATCH (Expected: 80-95)"
echo "----------------------------------------"
test_scenario \
    "SCENARIO 1: PERFECT MATCH" \
    80 \
    95 \
    '{"job_description": "Looking for a React developer with experience in React, JavaScript, and frontend performance optimization", "candidate_bio": "Frontend developer with strong experience in React, JavaScript, and building optimized UI applications", "job_skills": ["React", "JavaScript", "Frontend"], "candidate_skills": ["React", "JavaScript", "Frontend"]}'

echo "SCENARIO 2: PARTIAL MATCH (Expected: 50-70)"
echo "----------------------------------------"
test_scenario \
    "SCENARIO 2: PARTIAL MATCH" \
    50 \
    70 \
    '{"job_description": "Backend developer needed with Spring Boot and PostgreSQL", "candidate_bio": "Fullstack developer with React and some backend exposure", "job_skills": ["Spring Boot", "PostgreSQL"], "candidate_skills": ["React", "JavaScript"]}'

echo "SCENARIO 3: SKILL MATCH BUT SEMANTIC LOW (Expected: 40-60)"
echo "----------------------------------------"
test_scenario \
    "SCENARIO 3: SKILL MATCH BUT SEMANTIC LOW" \
    40 \
    60 \
    '{"job_description": "Machine learning engineer for deep learning research", "candidate_bio": "Software developer with Python scripting experience", "job_skills": ["Python", "Machine Learning"], "candidate_skills": ["Python"]}'

echo "SCENARIO 4: SEMANTIC MATCH BUT SKILL MISMATCH (Expected: 45-65)"
echo "----------------------------------------"
test_scenario \
    "SCENARIO 4: SEMANTIC MATCH BUT SKILL MISMATCH" \
    45 \
    65 \
    '{"job_description": "Cyber security analyst for threat detection and risk analysis", "candidate_bio": "Security enthusiast with interest in risk analysis and system vulnerabilities", "job_skills": ["Cyber Security", "Threat Detection"], "candidate_skills": ["Networking"]}'

echo "SCENARIO 5: NO MATCH (Expected: 0-30)"
echo "----------------------------------------"
test_scenario \
    "SCENARIO 5: NO MATCH" \
    0 \
    30 \
    '{"job_description": "iOS developer with Swift and UIKit", "candidate_bio": "Backend Java developer working with Spring Boot", "job_skills": ["Swift", "iOS"], "candidate_skills": ["Java", "Spring Boot"]}'

echo "=========================================="
echo "All tests completed!"
echo "=========================================="
