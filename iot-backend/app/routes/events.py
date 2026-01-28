from fastapi import APIRouter
from app.models import Event

router = APIRouter(prefix="/events", tags=["events"])

fake_db: list[Event] = []

@router.get("/")
def get_events():
    return fake_db

@router.post("/")
def create_sensor(sensor: Event):
    fake_db.append(sensor)
    return sensor

