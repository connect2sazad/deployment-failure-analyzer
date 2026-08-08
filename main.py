from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from github_service import (
    get_workflow_runs,
    get_workflow_jobs,
    get_job_log,
    get_workflow_run,
)

from analyzer import analyze_log
from database import Base, engine, SessionLocal
from models import Analysis


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Deployment Failure Analyzer",
    version="0.2.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LogRequest(BaseModel):
    log: str


@app.get("/")
def home():
    return {
        "name": "Deployment Failure Analyzer",
        "version": "0.2.0",
        "status": "running",
    }


# ---------------------------------------------------------
# Manual Log Analysis
# ---------------------------------------------------------

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
            fix=result["fix"],
            source="manual",
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        result["id"] = analysis.id
        result["source"] = "manual"

    finally:
        db.close()

    return result


# ---------------------------------------------------------
# Analysis History
# ---------------------------------------------------------

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

                "source": analysis.source,
                "repository": analysis.repository,
                "workflow_name": analysis.workflow_name,
                "run_id": analysis.run_id,
                "job_id": analysis.job_id,
                "job_name": analysis.job_name,
                "branch": analysis.branch,
                "commit_sha": analysis.commit_sha,

                "created_at": analysis.created_at,
            }
            for analysis in analyses
        ]

    finally:
        db.close()


# ---------------------------------------------------------
# GitHub Workflow Runs
# ---------------------------------------------------------

@app.get("/github/runs")
async def github_runs():

    runs = await get_workflow_runs()

    return [
        {
            "id": run["id"],
            "name": run["name"],
            "branch": run["head_branch"],
            "status": run["status"],
            "conclusion": run["conclusion"],
            "event": run["event"],
            "commit": run["head_sha"][:7],
            "created_at": run["created_at"],
            "updated_at": run["updated_at"],
            "html_url": run["html_url"],
        }
        for run in runs
    ]


# ---------------------------------------------------------
# Analyze GitHub Workflow
# ---------------------------------------------------------

@app.post("/github/runs/{run_id}/analyze")
async def analyze_github_run(run_id: int):

    # Retrieve workflow metadata
    run = await get_workflow_run(run_id)

    # Retrieve all jobs belonging to this run
    jobs = await get_workflow_jobs(run_id)

    # Find every failed job
    failed_jobs = [
        job
        for job in jobs
        if job.get("conclusion") == "failure"
    ]

    if not failed_jobs:
        return {
            "run_id": run_id,
            "failed_jobs": 0,
            "analyses": [],
        }

    repository_name = run["repository"]["full_name"]
    workflow_name = run["name"]
    branch = run["head_branch"]
    commit_sha = run["head_sha"]

    analyses = []

    # Analyze EACH failed job separately
    for job in failed_jobs:

        job_id = job["id"]
        job_name = job["name"]

        # Download the actual GitHub Actions log
        log = await get_job_log(job_id)

        # Run existing rule-based analyzer
        result = analyze_log(log)

        db: Session = SessionLocal()

        try:
            analysis = Analysis(
                log=log,
                category=result["category"],
                confidence=result["confidence"],
                cause=result["cause"],
                fix=result["fix"],

                source="github",
                repository=repository_name,
                workflow_name=workflow_name,
                run_id=str(run_id),
                job_id=str(job_id),
                job_name=job_name,
                branch=branch,
                commit_sha=commit_sha,
            )

            db.add(analysis)
            db.commit()
            db.refresh(analysis)

            result["id"] = analysis.id

        finally:
            db.close()

        # Add CI/CD context to API response
        result["source"] = "github"
        result["repository"] = repository_name
        result["workflow_name"] = workflow_name
        result["run_id"] = run_id
        result["job_id"] = job_id
        result["job_name"] = job_name
        result["branch"] = branch
        result["commit_sha"] = commit_sha
        result["log"] = log

        analyses.append(result)

    return {
        "run_id": run_id,
        "failed_jobs": len(failed_jobs),
        "analyses": analyses,
    }