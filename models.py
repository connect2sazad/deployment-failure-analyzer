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

    created_at = Column(DateTime, default=datetime.utcnow)