import base64
import io
import os
import re
from typing import List, Optional, Set

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import spacy

MODEL_NAME = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_sm")
PORT = int(os.getenv("PORT", "8000"))

app = FastAPI(title="RizeOS AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok"}
    
# Lazy load to avoid blocking startup if model download is needed.
nlp = None
embedder = None


def get_nlp():
    global nlp
    if nlp is None:
        try:
            nlp = spacy.load(SPACY_MODEL)
        except OSError:
            raise RuntimeError(f"spaCy model {SPACY_MODEL} not installed. Run: python -m spacy download {SPACY_MODEL}")
    return nlp


def get_embedder():
    global embedder
    if embedder is None:
        try:
            # Load model first without specifying device to avoid meta tensor issues
            # Then explicitly move to CPU after loading
            import torch
            print(f"Loading SentenceTransformer model: {MODEL_NAME}")
            # Load without device specification first
            embedder = SentenceTransformer(MODEL_NAME)
            # Explicitly move to CPU after model is loaded
            embedder = embedder.to('cpu')
            # Test the model with a dummy encoding to ensure it's fully loaded
            print("Testing model with dummy encoding...")
            _ = embedder.encode(["test"], convert_to_numpy=True, show_progress_bar=False)
            print("Model loaded and tested successfully")
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error loading model: {error_details}")
            raise RuntimeError(f"Failed to load SentenceTransformer model: {str(e)}")
    return embedder


class SkillExtractRequest(BaseModel):
    text: Optional[str] = None
    resume_base64: Optional[str] = Field(None, description="Base64 encoded PDF bytes")


class SkillExtractResponse(BaseModel):
    skills: List[str]


class MatchRequest(BaseModel):
    job_description: str
    candidate_bio: str
    job_skills: Optional[List[str]] = None
    candidate_skills: Optional[List[str]] = None


class MatchResponse(BaseModel):
    score: float


class RecommendationRequest(BaseModel):
    bio: Optional[str] = ""
    skills: List[str] = []
    jobs: List[str] = []


@app.get("/health")
def health():
    return {"data": {"status": "ok"}}


# CORE SKILLS - Always pass filtering (including short tokens)
CORE_SKILLS = {
    "html", "css", "javascript", "js",
    "c", "c++", "c#", "python", "java",
    "sql", "mysql", "postgresql", "mongodb",
    "react", "angular", "vue",
    "node.js", "nodejs",
    "spring", "spring boot",
    "docker", "kubernetes",
    "aws", "azure", "gcp",
    "git", "github", "linux",
    "machine learning", "deep learning",
    "data science", "cyber security", "cybersecurity",
    "ai", "ml", "dl",  # Short forms
}

# STAGE 1: SKILL VOCABULARY FILTER (PRIMARY) - Extended dictionary
SKILL_DICTIONARY = {
    # Core skills (always included)
    *CORE_SKILLS,
    
    # Additional Programming Languages
    "typescript", "go", "rust", "kotlin", "swift", "php", "ruby", "scala", "r", 
    "matlab", "perl", "lua", "dart", "haskell", "clojure", "erlang", "elixir", 
    "f#", "vb.net", "objective-c", "assembly",
    
    # Web Frameworks & Libraries
    "vue.js", "express", "next.js", "nextjs", "django", "flask", "fastapi",
    "laravel", "symfony", "rails", "asp.net", "aspnet", "jquery", "bootstrap",
    "tailwind css", "sass", "scss", "less", "webpack", "vite", "npm", "yarn", "pnpm",
    
    # Mobile Development
    "react native", "flutter", "xamarin", "ionic", "android", "ios",
    
    # Additional Databases
    "postgres", "redis", "cassandra", "elasticsearch", "oracle", "sql server",
    "sqlite", "dynamodb", "couchdb", "neo4j", "firebase", "mariadb", "influxdb", "couchbase",
    
    # Cloud & DevOps
    "google cloud", "k8s", "jenkins", "terraform", "ansible", "chef", "puppet",
    "gitlab", "bitbucket", "ci/cd", "cicd", "github actions", "gitlab ci",
    "circleci", "travis ci", "prometheus", "grafana", "elk stack", "splunk",
    "datadog", "new relic",
    
    # Tools & Platforms
    "unix", "windows", "macos", "bash", "shell scripting", "powershell",
    "apache", "nginx", "tomcat", "iis", "rabbitmq", "kafka", "rabbit mq",
    
    # ML/AI
    "neural networks", "tensorflow", "pytorch", "keras", "scikit-learn", "scikit learn",
    "pandas", "numpy", "matplotlib", "seaborn", "opencv", "nltk", "spacy",
    "transformers", "hugging face", "huggingface",
    
    # Data & Analytics
    "spark", "hadoop", "hive", "pig", "hbase", "airflow", "presto", "tableau",
    "power bi", "powerbi", "qlik", "looker", "snowflake", "redshift", "bigquery",
    
    # Security
    "penetration testing", "pen testing", "owasp", "ssl", "tls", "vpn",
    "firewall", "siem", "ids", "ips",
    
    # Other Technologies
    "rest api", "restful api", "graphql", "soap", "microservices", "api",
    "json", "xml", "http", "https", "tcp/ip", "udp", "websocket", "grpc",
    "blockchain", "ethereum", "solidity", "web3", "smart contracts",
    "agile", "scrum", "kanban", "devops", "sre", "site reliability",
}

# STAGE 2: NEGATIVE KEYWORD FILTER (BLOCKLIST)
NEGATIVE_KEYWORDS = {
    # Education
    "school", "college", "university", "institute", "institution", "academy",
    "matriculation", "higher secondary", "secondary", "primary", "elementary",
    "degree", "bachelor", "master", "phd", "doctorate", "diploma", "certificate",
    "b.tech", "m.tech", "b.e", "m.e", "b.sc", "m.sc", "b.com", "m.com",
    "bachelor of", "master of", "doctor of", "ph.d", "phd",
    
    # Common degree names
    "engineering", "science", "arts", "commerce", "business", "management",
    "computer science", "information technology", "electronics", "mechanical",
    "electrical", "civil", "chemical", "aerospace",
    
    # Location indicators
    "department", "faculty", "campus", "branch", "section",
    
    # Generic terms
    "years", "year", "experience", "worked", "worked at", "company", "corporation",
    "inc", "ltd", "llc", "private limited",
}

# Skill normalization mappings (STRONG NORMALIZATION)
SKILL_NORMALIZATIONS = {
    # Short forms
    "js": "javascript",
    "ai": "artificial intelligence",
    "ml": "machine learning",
    "dl": "deep learning",
    
    # Version numbers
    "html5": "html",
    "css3": "css",
    
    # Node.js variants
    "nodejs": "node.js",
    "node js": "node.js",
    
    # Next.js variants
    "nextjs": "next.js",
    "next js": "next.js",
    
    # API variants
    "restful apis": "rest api",
    "restful api": "rest api",
    "restful": "rest api",
    
    # C++ variants
    "c plus plus": "c++",
    "cpp": "c++",
    
    # SQL variants
    "structured query language": "sql",
    
    # Cloud variants
    "k8s": "kubernetes",
    "gcp": "google cloud",
    "aws cloud": "aws",
    "azure cloud": "azure",
    
    # Database variants
    "postgres": "postgresql",
    "postgres db": "postgresql",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    
    # Keep SQL as-is (common standalone skill)
}


def _normalize_skill(skill: str) -> str:
    """Normalize skill variants to standard form (STRONG NORMALIZATION)."""
    # Step 1: lowercase and trim
    skill_lower = skill.lower().strip()
    
    # Step 2: Remove common suffixes/prefixes
    skill_clean = re.sub(r'\s*(framework|library|tool|technology|platform|service|api|sdk|language|programming)\s*$', '', skill_lower)
    skill_clean = skill_clean.strip()
    
    # Step 3: Check normalization mappings
    if skill_clean in SKILL_NORMALIZATIONS:
        normalized = SKILL_NORMALIZATIONS[skill_clean]
    else:
        normalized = skill_clean
    
    # Step 4: Capitalize appropriately (first letter of each word)
    if normalized:
        words = normalized.split()
        if len(words) == 1:
            # Single word: capitalize first letter
            normalized = normalized.capitalize()
        else:
            # Multi-word: capitalize each word
            normalized = " ".join(word.capitalize() for word in words)
    
    return normalized if normalized else skill.strip()


def _is_valid_skill(candidate: str, skill_dict: Set[str]) -> bool:
    """Check if candidate matches any skill in dictionary (case-insensitive, partial match)."""
    candidate_lower = candidate.lower().strip()
    
    # Remove common suffixes/prefixes
    candidate_clean = re.sub(r'\s*(framework|library|tool|technology|platform|service|api|sdk)\s*$', '', candidate_lower)
    candidate_clean = candidate_clean.strip()
    
    # Exact match
    if candidate_clean in skill_dict or candidate_lower in skill_dict:
        return True
    
    # Check if any skill in dictionary matches
    for skill in skill_dict:
        skill_lower = skill.lower()
        # Exact match
        if candidate_clean == skill_lower or candidate_lower == skill_lower:
            return True
        # Multi-word skill match (e.g., "spring boot" in "Spring Boot Framework")
        if " " in skill_lower:
            # Check if skill is contained in candidate or vice versa
            if skill_lower in candidate_lower or candidate_clean in skill_lower:
                return True
        # Single word match (e.g., "java" matches "Java Developer")
        else:
            # Word boundary match to avoid partial matches
            if re.search(rf'\b{re.escape(skill_lower)}\b', candidate_lower):
                return True
    
    return False


def _contains_negative_keyword(text: str) -> bool:
    """Check if text contains any negative keyword."""
    text_lower = text.lower()
    for keyword in NEGATIVE_KEYWORDS:
        if keyword in text_lower:
            return True
    return False


def _extract_skills_from_section(text: str) -> str:
    """Extract text from skills-related sections only (STRICT)."""
    # Normalize text for easier parsing
    text_normalized = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # STRICT: Only extract from these sections
    skills_keywords = [
        "skills", "technical skills", "core skills", "tools & technologies",
        "tools and technologies", "programming languages", "languages"
    ]
    
    # STRICT: Ignore these sections completely
    ignore_keywords = [
        "education", "academic background", "academic", "school", "college",
        "address", "certifications", "certification", "qualification", "qualifications"
    ]
    
    skills_text = ""
    lines = text_normalized.split('\n')
    in_skills_section = False
    skills_section_content = []
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        line_lower = line_stripped.lower()
        
        # Check if this is an ignored section - skip completely
        is_ignored_section = False
        for keyword in ignore_keywords:
            if re.match(rf"^({re.escape(keyword)})[:;]?\s*$", line_lower):
                is_ignored_section = True
                in_skills_section = False
                # Skip until next major section
                break
        
        if is_ignored_section:
            continue
        
        # Check if this line is a skills section header
        is_skills_header = False
        for keyword in skills_keywords:
            # Match section headers like "SKILLS:", "Technical Skills:", etc.
            if re.match(rf"^({re.escape(keyword)})[:;]?\s*$", line_lower):
                is_skills_header = True
                break
        
        if is_skills_header:
            in_skills_section = True
            skills_section_content = []
            continue
        
        # Check if we hit another major section
        if in_skills_section:
            # Stop at next major section (all caps line with colon, or new section header)
            if line_stripped and (
                (line_stripped.isupper() and len(line_stripped) > 3 and ':' in line_stripped)
                or any(keyword in line_lower for keyword in ignore_keywords + ["experience", "projects", "work"])
            ):
                break
            
            # Collect content from skills section
            if line_stripped:
                skills_section_content.append(line_stripped)
    
    if skills_section_content:
        skills_text = " ".join(skills_section_content)
    
    return skills_text  # Return empty string if no skills section found (fallback will handle)


@app.post("/skills/extract", response_model=SkillExtractResponse)
def extract_skills(req: SkillExtractRequest):
    text = req.text or ""
    if req.resume_base64:
        try:
            decoded = base64.b64decode(req.resume_base64)
            reader = PdfReader(io.BytesIO(decoded))
            parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    parts.append(page_text)
            text += "\n".join(parts)
        except Exception as exc:  # pylint: disable=broad-except
            raise HTTPException(status_code=400, detail=f"Invalid resume: {exc}") from exc
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from PDF. Please use a text-based (non-scanned) PDF.")

    # STAGE 4: Section-aware extraction (STRICT)
    skills_text = _extract_skills_from_section(text)
    
    # FALLBACK: If no skills section found, scan entire text but apply filters
    use_fallback = not skills_text.strip()
    if use_fallback:
        # Filter out education sections from entire text
        lines = text.split('\n')
        filtered_lines = []
        skip_section = False
        for line in lines:
            line_lower = line.lower().strip()
            # Skip education sections
            if any(keyword in line_lower for keyword in 
                   ["education", "academic", "qualification", "degree", "university", "college", "school"]):
                skip_section = True
                continue
            # Resume after section ends
            if skip_section:
                if not line.strip() or (line.strip() and not line[0].isspace()):
                    skip_section = False
            if not skip_section:
                filtered_lines.append(line)
        skills_text = "\n".join(filtered_lines)
    
    # Process with spaCy
    doc = get_nlp()(skills_text)
    extracted_candidates = set()
    
    # Extract noun phrases and entities
    for token in doc.noun_chunks:
        phrase = token.text.strip()
        if 1 <= len(phrase.split()) <= 3:  # Limit to 1-3 words
            extracted_candidates.add(phrase)
    
    # Extract named entities (PRODUCT, ORG for tech products)
    for ent in doc.ents:
        if ent.label_ in ["PRODUCT", "ORG"]:
            text_clean = ent.text.strip()
            if 1 <= len(text_clean.split()) <= 3:
                extracted_candidates.add(text_clean)
    
    # Extract individual technical terms (including short tokens)
    for token in doc:
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop:
            text_clean = token.text.strip()
            # Allow short tokens if they're in CORE_SKILLS
            if text_clean.lower() in CORE_SKILLS:
                extracted_candidates.add(text_clean)
            elif len(text_clean) > 2 and text_clean.isalnum():
                extracted_candidates.add(text_clean)
    
    # Also extract from comma-separated lists (common in skills sections)
    for line in skills_text.split('\n'):
        # Look for patterns like "Skills: HTML, CSS, JS, Java"
        if ':' in line:
            after_colon = line.split(':', 1)[1]
            # Split by comma and add candidates
            for item in after_colon.split(','):
                item_clean = item.strip()
                if item_clean:
                    extracted_candidates.add(item_clean)
    
    # STAGE 1: Filter by skill dictionary
    valid_skills = set()
    for candidate in extracted_candidates:
        candidate_clean = candidate.strip()
        
        # FIX: Allow short tokens if in CORE_SKILLS
        candidate_lower = candidate_clean.lower()
        is_core_skill = candidate_lower in CORE_SKILLS
        
        # Only apply length filter if NOT a core skill
        if not is_core_skill and len(candidate_clean) < 2:
            continue
        
        # STAGE 2: Negative keyword filter (safety net)
        if _contains_negative_keyword(candidate_clean):
            continue
        
        # STAGE 3: POS filter - reject long capitalized phrases (likely institutions)
        words = candidate_clean.split()
        if len(words) > 3:
            continue
        if len(words) > 1 and candidate_clean.isupper() and len(candidate_clean) > 15:
            continue
        
        # Check against skill dictionary (CORE_SKILLS always pass)
        if is_core_skill or _is_valid_skill(candidate_clean, SKILL_DICTIONARY):
            # STAGE 5: Normalize
            normalized = _normalize_skill(candidate_clean)
            if normalized:  # Only add if normalization produced a valid result
                valid_skills.add(normalized)
    
    # FINAL OUTPUT: Unique, normalized, sorted
    skills_list = sorted(list(valid_skills), key=str.lower)[:25]
    
    # Backward compatibility
    return {"skills": skills_list, "extractedSkills": skills_list}


def _normalize_skills_list(skills: List[str]) -> Set[str]:
    """Normalize a list of skills: lowercase, trim, apply aliases, deduplicate."""
    normalized = set()
    for skill in skills:
        if not skill or not skill.strip():
            continue
        # Normalize using existing function
        norm_skill = _normalize_skill(skill).lower().strip()
        if norm_skill:
            normalized.add(norm_skill)
    return normalized


def _required_skill_coverage(required_skills: List[str], candidate_skills: List[str]) -> float:
    """
    Calculate skill score based on REQUIRED SKILL COVERAGE.
    
    Logic:
    - Normalize all skills (lowercase, trim, alias mapping, deduplicate)
    - Count how many required skills the candidate has
    - Score = matched_required / total_required
    - Extra skills NEVER penalize (only required skills matter)
    - Optional bonus for extra relevant skills (capped at 0.05)
    
    Returns:
        float: Skill score between 0.0 and 1.0
    """
    if not required_skills or not candidate_skills:
        return 0.0
    
    # STEP 1: Normalize skills
    req_normalized = _normalize_skills_list(required_skills)
    cand_normalized = _normalize_skills_list(candidate_skills)
    
    if not req_normalized:
        return 0.0
    
    # STEP 2: Calculate required skill coverage
    matched_required = len(req_normalized & cand_normalized)
    total_required = len(req_normalized)
    
    # Base score: coverage of required skills
    skill_score = matched_required / total_required if total_required > 0 else 0.0
    
    # STEP 3: Optional bonus for extra relevant skills (capped at 0.05)
    extra_skills = cand_normalized - req_normalized
    if extra_skills and skill_score > 0:
        # Small bonus for having additional skills (shows breadth)
        bonus = min(len(extra_skills) * 0.02, 0.05)
        skill_score = min(skill_score + bonus, 1.0)
    
    # Ensure score is between 0 and 1
    return max(0.0, min(1.0, skill_score))


@app.post("/match", response_model=MatchResponse)
def match(req: MatchRequest):
    """
    Calculate job fitment score using:
    - Semantic similarity (70%): Sentence Transformers + cosine similarity
    - Skill coverage (30%): Required skill coverage (NOT Jaccard)
    
    The skill score is based on REQUIRED SKILL COVERAGE:
    - Having ALL required skills = high score (95%+)
    - Extra skills NEVER penalize
    - Only required skills are considered for base score
    """
    try:
        # Validate inputs
        if not req.job_description or not req.job_description.strip():
            raise HTTPException(status_code=400, detail="job_description is required and cannot be empty")
        if not req.candidate_bio or not req.candidate_bio.strip():
            raise HTTPException(status_code=400, detail="candidate_bio is required and cannot be empty")
        
        embedder = get_embedder()
        
        # Encode job description and candidate bio
        # Use convert_to_numpy=True to ensure we get numpy arrays, not PyTorch tensors
        try:
            embeddings = embedder.encode(
                [req.job_description, req.candidate_bio],
                convert_to_numpy=True,
                show_progress_bar=False,
                normalize_embeddings=False
            )
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Encoding error: {error_details}")
            raise HTTPException(status_code=500, detail=f"Failed to encode text: {str(e)}")
        
        if len(embeddings) != 2:
            raise HTTPException(status_code=500, detail="Embedding failed: expected 2 vectors")
        
        job_vec, cand_vec = embeddings[0], embeddings[1]
        
        # Calculate cosine similarity
        try:
            dot_product = np.dot(job_vec, cand_vec)
            job_norm = np.linalg.norm(job_vec)
            cand_norm = np.linalg.norm(cand_vec)
            
            if job_norm == 0 or cand_norm == 0:
                # Handle zero vectors (empty or whitespace-only text)
                cos = 0.0
            else:
                cos = float(dot_product / (job_norm * cand_norm))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to calculate cosine similarity: {str(e)}")
        
        embed_score = (cos + 1) / 2  # Normalize to 0..1

        # Calculate skill score using REQUIRED SKILL COVERAGE (not Jaccard)
        skill_score = 0.0
        if req.job_skills and req.candidate_skills:
            try:
                skill_score = _required_skill_coverage(req.job_skills, req.candidate_skills)
            except Exception as e:
                # If skill coverage calculation fails, log but continue with 0.0
                print(f"Warning: Skill coverage calculation failed: {e}")
                skill_score = 0.0

        # Apply semantic threshold penalty for completely unrelated profiles
        # Penalties help identify domain mismatches and unrelated profiles
        if embed_score < 0.35:
            # Very low semantic (< 0.35): aggressive penalty for completely unrelated
            embed_score = embed_score * 0.15  # Reduce by 85%
        elif embed_score < 0.45:
            # Low semantic (0.35-0.45): strong penalty for domain mismatches
            embed_score = embed_score * 0.5  # Reduce by 50%
        elif embed_score < 0.55 and skill_score < 0.3:
            # Medium-low semantic with low skill coverage: likely domain mismatch
            embed_score = embed_score * 0.75  # Reduce by 25%

        # Hybrid weight: 70% semantic similarity, 30% skill coverage
        # This ensures semantic understanding dominates, while skill coverage provides precision
        hybrid = 0.7 * embed_score + 0.3 * skill_score
        
        # Convert to percentage and clamp to 0-100
        normalized = round(hybrid * 100, 2)
        normalized = max(0.0, min(100.0, normalized))
        return {"score": normalized}
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any other unexpected errors
        import traceback
        error_details = traceback.format_exc()
        print(f"Unexpected error in match endpoint: {error_details}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/recommendations/recruiter")
def recruiter_reco(req: RecommendationRequest):
    top_skills = req.skills[:5]
    suggestions = [f"Search candidates with {skill}" for skill in top_skills]
    return {"data": {"suggestions": suggestions, "top_skills": top_skills}}


@app.post("/recommendations/seeker")
def seeker_reco(req: RecommendationRequest):
    suggested_jobs = req.jobs[:3] if req.jobs else []
    return {"data": {"suggestions": suggested_jobs or ["Complete your profile to see matches"], "skills": req.skills}}

