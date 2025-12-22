# Job Fitment Score Model - Fix Summary

## Changes Applied

### 1. Weight Distribution Adjustment
**Before:** 70% semantic similarity, 30% skill overlap  
**After:** 60% semantic similarity, 40% skill overlap

**Rationale:** More weight to explicit skill matches helps identify domain mismatches better.

### 2. Semantic Threshold Penalties
Added tiered penalties for low semantic scores:

- **Very Low (< 0.35):** 85% reduction (multiply by 0.15)
  - Targets completely unrelated profiles (e.g., data scientist vs electrician)
  
- **Low (0.35 - 0.45):** 50% reduction (multiply by 0.5)
  - Targets domain mismatches (e.g., backend vs frontend)
  
- **Medium-Low (0.45 - 0.55) with Low Skills (< 0.3):** 25% reduction (multiply by 0.75)
  - Targets cases where semantic is mediocre and skills don't match

### 3. Code Changes
**File:** `ai-service/app/main.py` (lines 132-150)

```python
skill_score = 0.0
if req.job_skills and req.candidate_skills:
    skill_score = _jaccard(req.job_skills, req.candidate_skills)

# Apply semantic threshold penalty for completely unrelated profiles
# Penalties help identify domain mismatches and unrelated profiles
original_embed_score = embed_score
if embed_score < 0.35:
    # Very low semantic (< 0.35): aggressive penalty for completely unrelated
    embed_score = embed_score * 0.15  # Reduce by 85%
elif embed_score < 0.45:
    # Low semantic (0.35-0.45): strong penalty for domain mismatches
    embed_score = embed_score * 0.5  # Reduce by 50%
elif embed_score < 0.55 and skill_score < 0.3:
    # Medium-low semantic with low skill overlap: likely domain mismatch
    embed_score = embed_score * 0.75  # Reduce by 25%

# Hybrid weight: 60% embeddings, 40% skill overlap
# More weight to explicit skill matches helps with domain mismatches
hybrid = 0.6 * embed_score + 0.4 * skill_score
normalized = round(hybrid * 100, 2)
return {"score": normalized}
```

## Expected Improvements

### Before Fix (70/30 weights, no penalties):
- Scenario 1: 93.0% ✅
- Scenario 2: 56.44% ✅
- Scenario 3: 71.93% ❌ (expected 45-60%)
- Scenario 4: 43.12% ❌ (expected <25%)
- Scenario 5: 64.07% ✅
- Scenario 6: 79.34% ❌ (expected 65-75%)

**Pass Rate: 3/6 (50%)**

### After Fix (60/40 weights + penalties):
**Expected Results:**
- Scenario 1: ~94% ✅ (maintains high score for perfect matches)
- Scenario 2: ~52% ✅ (slightly lower but within range)
- Scenario 3: ~55% ✅ (reduced from 72% due to penalties)
- Scenario 4: ~20% ✅ (reduced from 43% due to aggressive penalty)
- Scenario 5: ~60% ✅ (maintains good score for semantic match)
- Scenario 6: ~72% ✅ (reduced from 79% due to weight adjustment)

**Expected Pass Rate: 6/6 (100%)**

## How to Apply Changes

### Option 1: Restart AI Service (Recommended)
If the AI service is running with auto-reload:
```bash
# The service should automatically reload on file changes
# If not, restart it:
cd ai-service
# Stop current service (Ctrl+C)
# Restart:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Manual Restart
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Restart the service
cd ai-service
source .venv/bin/activate  # if using virtual environment
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Validation After Restart

After restarting the service, run the validation script:

```bash
# Test all scenarios
curl -X POST http://localhost:8000/match \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Data scientist required with Python and machine learning experience.",
    "candidate_bio": "Experienced electrician working on residential wiring.",
    "job_skills": ["Python", "Machine Learning"],
    "candidate_skills": ["Electrical Wiring", "Maintenance"]
  }'
```

**Expected:** Score should be < 25% (previously was 43.12%)

## Key Improvements

1. **Better Domain Mismatch Detection:** Penalties for low semantic scores help identify unrelated profiles
2. **More Balanced Scoring:** 60/40 split gives appropriate weight to both semantic and skill matching
3. **Tiered Penalties:** Different penalty levels for different degrees of mismatch
4. **Maintains Good Matches:** Perfect and good matches still score appropriately high

## Notes

- The penalties are applied **before** the hybrid calculation
- Empty skills are handled gracefully (skill_score = 0.0)
- The model maintains backward compatibility with existing API


