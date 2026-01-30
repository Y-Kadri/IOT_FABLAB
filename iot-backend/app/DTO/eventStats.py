from sqlmodel import SQLModel
from typing import Optional

class EventStats(SQLModel):
    average_temperature: Optional[float] = None
    average_humidity: Optional[float] = None
    total_movements: int = 0
