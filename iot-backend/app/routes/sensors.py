from fastapi import APIRouter
from app.models import Sensor

router = APIRouter(prefix="/sensors", tags=["sensors"])

fake_db: list[Sensor] = []

@router.get("/")
def get_sensors():
    return fake_db

@router.post("/")
def create_sensor(sensor: Sensor):
    fake_db.append(sensor)
    return sensor
