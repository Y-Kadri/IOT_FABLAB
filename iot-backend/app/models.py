from sqlmodel import SQLModel, Field

class Sensor(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    value: float
