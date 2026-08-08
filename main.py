from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from analyzer import analyze_log
from database import Base, engine, SessionLocal
from models import Analysis

Base.metadata.create_all(bind=engine)  # Create the database tables if they don't exist

# Create a FastAPI app instance with a title and version
app = FastAPI(
    title = "Deployment Failure Analyzer",
    version = "0.1.0"
)

# Allow CORS for the frontend running on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173/"
    ],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

# Define a Pydantic model for the request body of the /analyze endpoint
class LogRequest(BaseModel):
    log: str


# Define a GET endpoint at the root URL that returns the name and status of the application
@app.get("/")
def home():
    return {
        "name": "Deployment Failure Analyzer",
        "status": "running"
    }

# Define a POST endpoint at /analyze that takes a LogRequest object as input and returns the analysis result
@app.post("/analyze")
def analyze(request: LogRequest):

    result = analyze_log(request.log)

    db: Session = SessionLocal()

    try:

        analysis = Analysis(
            log=request.log,
            category=result["category"],
            confidence=result["confidence"],
            cause=result["cause"],
            fix=result["fix"]
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        result["id"] = analysis.id

    finally:
        db.close()

    return result

@app.get("/analyses")
def get_analyses():
    db: Session = SessionLocal()

    try:
        analyses = (
            db.query(Analysis)
            .order_by(Analysis.id.desc())
            .limit(20)
            .all()
        )

        return [
            {
                "id": analysis.id,
                "log": analysis.log,
                "category": analysis.category,
                "confidence": analysis.confidence,
                "cause": analysis.cause,
                "fix": analysis.fix,
                "created_at": analysis.created_at
            }

            for analysis in analyses
        ]
    
    finally:
        db.close()