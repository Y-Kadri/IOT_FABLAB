from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Zone(SQLModel, table=True):
    id_zone: Optional[int] = Field(default=None, primary_key=True)
    name: str
    events: List["Event"] = Relationship(back_populates="zone")


class Event(SQLModel, table=True):
    id_value: Optional[int] = Field(default=None, primary_key=True)
    temperature: Optional[float] = None
    airquality: Optional[float] = None
    humidity: Optional[float] = None
    movement: Optional[bool] = None
    noise: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)  # <-- renomme datetime en timestamp

    id_zone: int = Field(foreign_key="zone.id_zone")
    zone: Optional[Zone] = Relationship(back_populates="events")
