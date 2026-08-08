from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Float, DateTime

from database import Base

class Analysis(Base):

    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)

    log = Column(Text, nullable=False)

    category = Column(String, nullable=False)

    confidence = Column(Float, nullable=False)

    cause = Column(Text, nullable=False)

    fix = Column(Text, nullable=False)

    source = Column(String(50), default="manual")

    repository = Column(String(255), nullable=True)

    workflow_name = Column(String(255), nullable=True)

    run_id = Column(String(100), nullable=True)

    job_id = Column(String(100), nullable=True)

    job_name = Column(String(255), nullable=True)

    branch = Column(String(255), nullable=True)

    commit_sha = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)