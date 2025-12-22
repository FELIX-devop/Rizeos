#!/bin/bash

# Test script for improved skill extraction
# Run this when the AI service is running on localhost:8000

echo "=========================================="
echo "Testing Improved Skill Extraction"
echo "=========================================="
echo ""

AI_SERVICE_URL="http://localhost:8000"

echo "Test 1: Basic skills extraction (should extract Java, Spring Boot, MySQL)"
echo "Input: 'Completed B.E from Anna University. Skilled in Java, Spring Boot, and MySQL.'"
echo ""
curl -s -X POST "$AI_SERVICE_URL/skills/extract" \
  -H "Content-Type: application/json" \
  -d '{"text": "Completed B.E from Anna University. Skilled in Java, Spring Boot, and MySQL."}' | python3 -m json.tool
echo ""
echo ""

echo "Test 2: Should NOT extract education terms"
echo "Input: 'Bachelor of Engineering from Chennai University. Computer Science Department.'"
echo ""
curl -s -X POST "$AI_SERVICE_URL/skills/extract" \
  -H "Content-Type: application/json" \
  -d '{"text": "Bachelor of Engineering from Chennai University. Computer Science Department."}' | python3 -m json.tool
echo ""
echo ""

echo "Test 3: Complex resume with skills section"
echo "Input: Resume with skills section"
echo ""
curl -s -X POST "$AI_SERVICE_URL/skills/extract" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "EDUCATION\nBachelor of Engineering from Anna University\n\nSKILLS\nJava, Spring Boot, React, MongoDB, Docker, AWS\n\nEXPERIENCE\nSoftware Developer at XYZ Corp"
  }' | python3 -m json.tool
echo ""
echo ""

echo "Test 4: Normalization test (JS -> JavaScript, NodeJS -> Node.js)"
echo "Input: 'Proficient in JS, NodeJS, and RESTful APIs'"
echo ""
curl -s -X POST "$AI_SERVICE_URL/skills/extract" \
  -H "Content-Type: application/json" \
  -d '{"text": "Proficient in JS, NodeJS, and RESTful APIs"}' | python3 -m json.tool
echo ""
echo ""

echo "=========================================="
echo "Tests completed!"
echo "=========================================="

