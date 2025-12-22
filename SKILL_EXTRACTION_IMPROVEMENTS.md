# Skill Extraction Improvements

## Problem
Previous implementation extracted noisy terms:
- ❌ Institution names (Anna University, XYZ School)
- ❌ Degree names (Bachelor of Engineering, B.E)
- ❌ Locations (Chennai, Computer Science Department)
- ❌ Generic terms (years, experience, company)

## Solution: Multi-Stage Pipeline

### STAGE 1: Skill Vocabulary Filter (PRIMARY)
- **Whitelist approach**: Only extract skills from predefined dictionary
- **Case-insensitive matching**: "Java" = "java" = "JAVA"
- **Partial matching**: "Spring Boot" matches "Spring Boot Framework"
- **Comprehensive dictionary**: 200+ technical skills covering:
  - Programming languages
  - Frameworks & libraries
  - Databases
  - Cloud & DevOps tools
  - ML/AI technologies
  - Security tools

### STAGE 2: Negative Keyword Filter (BLOCKLIST)
- **Education keywords**: school, college, university, degree, bachelor, master, etc.
- **Location indicators**: department, faculty, campus, branch
- **Generic terms**: years, experience, company, corporation
- **Rejects any candidate containing these keywords**

### STAGE 3: Part-of-Speech Filter
- **Rejects long capitalized phrases** (>3 words, >15 chars) - likely institutions
- **Prefers nouns and noun phrases**
- **Limits to 1-3 word phrases** for precision

### STAGE 4: Section-Aware Extraction (IMPORTANT)
- **Extracts ONLY from skills sections**:
  - "Skills"
  - "Technical Skills"
  - "Core Competencies"
  - "Tools & Technologies"
- **Excludes education sections**:
  - "Education"
  - "Academic"
  - "Qualifications"
- **Falls back to full text** if no skills section found, but filters education sections

### STAGE 5: Skill Normalization
- **Variant normalization**:
  - "JS" → "JavaScript"
  - "NodeJS" → "Node.js"
  - "RESTful API" → "REST API"
  - "ML" → "Machine Learning"
- **Removes duplicates** after normalization
- **Standardizes skill names** for consistency

## Example

**Input:**
```
Completed B.E from Anna University. 
Skilled in Java, Spring Boot, and MySQL.
```

**Output:**
```json
{
  "skills": ["Java", "Spring Boot", "MySQL"],
  "extractedSkills": ["Java", "Spring Boot", "MySQL"]
}
```

**Rejected:**
- ❌ "B.E" (degree name)
- ❌ "Anna University" (institution)
- ✅ "Java" (in skill dictionary)
- ✅ "Spring Boot" (in skill dictionary)
- ✅ "MySQL" (in skill dictionary)

## Key Features

1. **High Precision**: Focus on precision over recall
2. **Whitelist-based**: Only known technical skills
3. **Section-aware**: Prefers skills sections
4. **Normalized**: Consistent skill names
5. **Filtered**: No education/location noise

## Testing

Run the test script:
```bash
./ai-service/test_skill_extraction.sh
```

Or test manually:
```bash
curl -X POST http://localhost:8000/skills/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "Completed B.E from Anna University. Skilled in Java, Spring Boot, and MySQL."}'
```

Expected: `["Java", "Spring Boot", "MySQL"]`

## Production Readiness

✅ Suitable for:
- Job fitment scoring
- Recruiter filtering
- Candidate ranking
- Skill-based matching

✅ High precision extraction
✅ No false positives from education/location
✅ Normalized skill names
✅ Comprehensive skill dictionary

