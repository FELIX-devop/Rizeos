from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["data"]["status"] == "ok"


def test_extract_skills():
    res = client.post("/skills/extract", json={"text": "Expert in Python, React and Solidity"})
    assert res.status_code == 200
    assert "skills" in res.json()


def test_match():
    payload = {"job_description": "Looking for Go backend engineer", "candidate_bio": "I build services in Go"}
    res = client.post("/match", json=payload)
    assert res.status_code == 200
    assert "score" in res.json()

