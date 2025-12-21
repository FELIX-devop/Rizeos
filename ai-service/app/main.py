import base64
import io
import os
from typing import List, Optional

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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
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
        embedder = SentenceTransformer(MODEL_NAME)
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

    doc = get_nlp()(text)
    skills = set()
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "NORP"]:
            skills.add(ent.text.strip())
    for token in doc.noun_chunks:
        if 2 <= len(token.text.split()) <= 4:
            skills.add(token.text.strip())
    skills = [s for s in skills if len(s) > 2][:25]
    # Backward compatibility: keep "skills"; add "extractedSkills" for structured UI.
    return {"skills": list(skills), "extractedSkills": list(skills)}


def _jaccard(a: List[str], b: List[str]) -> float:
    set_a = {s.lower().strip() for s in a if s}
    set_b = {s.lower().strip() for s in b if s}
    if not set_a or not set_b:
        return 0.0
    inter = len(set_a & set_b)
    union = len(set_a | set_b)
    return inter / union if union else 0.0


@app.post("/match", response_model=MatchResponse)
def match(req: MatchRequest):
    embedder = get_embedder()
    embeddings = embedder.encode([req.job_description, req.candidate_bio])
    job_vec, cand_vec = embeddings[0], embeddings[1]
    cos = float(np.dot(job_vec, cand_vec) / (np.linalg.norm(job_vec) * np.linalg.norm(cand_vec)))
    embed_score = (cos + 1) / 2  # 0..1

    skill_score = 0.0
    if req.job_skills and req.candidate_skills:
        skill_score = _jaccard(req.job_skills, req.candidate_skills)

    # Hybrid weight: 70% embeddings, 30% skill overlap
    hybrid = 0.7 * embed_score + 0.3 * skill_score
    normalized = round(hybrid * 100, 2)
    return {"score": normalized}


@app.post("/recommendations/recruiter")
def recruiter_reco(req: RecommendationRequest):
    top_skills = req.skills[:5]
    suggestions = [f"Search candidates with {skill}" for skill in top_skills]
    return {"data": {"suggestions": suggestions, "top_skills": top_skills}}


@app.post("/recommendations/seeker")
def seeker_reco(req: RecommendationRequest):
    suggested_jobs = req.jobs[:3] if req.jobs else []
    return {"data": {"suggestions": suggested_jobs or ["Complete your profile to see matches"], "skills": req.skills}}

