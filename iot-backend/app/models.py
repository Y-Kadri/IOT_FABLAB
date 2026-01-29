from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, TIMESTAMP

class ZoneEnum(str, Enum):
    Carpentry = "Carpentry"
    Electronics = "Electronics"
    Laser = "Laser"


class Zone(SQLModel, table=True):
    __tablename__ = "zone"
    id_zone: Optional[int] = Field(default=None, primary_key=True)
    name: str
    events: List["Event"] = Relationship(back_populates="zone")


class Event(SQLModel, table=True):
    __tablename__ = "events"
    id_value: Optional[int] = Field(default=None, primary_key=True)
    temperature: Optional[float] = None
    airquality: Optional[float] = None
    humidity: Optional[float] = None
    movement: Optional[bool] = None
    noise: Optional[int] = None
    datereceive: datetime = Field(
        sa_column=Column("datereceive", TIMESTAMP, nullable=False, default=datetime.utcnow)
    )
    id_zone: int = Field(foreign_key="zone.id_zone")
    zone: Optional["Zone"] = Relationship(back_populates="events")