from sqlmodel import SQLModel
from typing import Optional

class EventCreate(SQLModel):
    zone_name: str
    temperature: Optional[float] = None
    airquality: Optional[float] = None
    humidity: Optional[float] = None
    movement: Optional[bool] = None
    noise: Optional[int] = None
