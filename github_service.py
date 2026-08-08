import os

import httpx
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_OWNER = os.getenv("GITHUB_OWNER")
GITHUB_REPO = os.getenv("GITHUB_REPO")

GITHUB_API = "https://api.github.com"

def get_headers():

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
    }

    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    return headers

async def get_workflow_runs():

    url = (
        f"{GITHUB_API}/repos/"
        f"{GITHUB_OWNER}/"
        f"{GITHUB_REPO}/actions/runs"
    )

    params = {
        "per_page": 10
    }

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=get_headers(),
            params=params,
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        return data["workflow_runs"]

async def get_workflow_jobs(run_id):

    url = (
        f"{GITHUB_API}/repos/"
        f"{GITHUB_OWNER}/"
        f"{GITHUB_REPO}/actions/runs/"
        f"{run_id}/jobs"
    )

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=get_headers(),
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        return data["jobs"]

async def get_job_log(job_id):

    url = (
        f"{GITHUB_API}/repos/"
        f"{GITHUB_OWNER}/"
        f"{GITHUB_REPO}/actions/jobs/"
        f"{job_id}/logs"
    )

    async with httpx.AsyncClient(
        follow_redirects=True
    ) as client:

        response = await client.get(
            url,
            headers=get_headers(),
            timeout=20
        )

        response.raise_for_status()

        return response.text

async def get_workflow_run(run_id):

    url = (
        f"{GITHUB_API}/repos/"
        f"{GITHUB_OWNER}/"
        f"{GITHUB_REPO}/actions/runs/"
        f"{run_id}"
    )

    async with httpx.AsyncClient() as client:

        response = await client.get(
            url,
            headers=get_headers(),
            timeout=20
        )

        response.raise_for_status()

        return response.json()