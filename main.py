from fastapi import FastAPI
from pydantic import BaseModel

from analyzer import analyze_log

app = FastAPI(
    title = "Deployment Failure Analyzer",
    version = "0.1.0"
)

class LogRequest(BaseModel):
    log: str


@app.get("/")
def home():
    return {
        "name": "Deployment Failure Analyzer",
        "status": "running"
    }

@app.post("/analyze")
def analyze(request: LogRequest):

    result = analyze_log(request.log)

    return result