from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from analyzer import analyze_log

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

    return result