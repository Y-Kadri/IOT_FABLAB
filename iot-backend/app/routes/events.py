from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.models import (
    Zone,
    ZoneEnum,
    TemperatureData,
    GasConcentration,
    MovementData,
    NoiseData,
    HumidityData
)
from app.DTO.eventsDTO import EventCreate
from app.DTO.eventStats import EventStats
from sqlalchemy import func
from app.services.led_management import LedManagementAPI


router = APIRouter()


router = APIRouter(prefix="/events", tags=["events"])

@router.post("/")
async def create_event(
    payload: EventCreate,
    session: AsyncSession = Depends(get_session)
):
    zone = (await session.execute(
        select(Zone).where(Zone.name == payload.zone_name)
    )).scalars().first()

    if not zone:
        raise HTTPException(500, f"Zone '{payload.zone_name}' not found")

    if payload.temperature is not None:
        session.add(
            TemperatureData(
                temperature=payload.temperature,
                id_zone=zone.id_zone
            )
        )

    if payload.humidity is not None:
        session.add(
            HumidityData(
                humidity=payload.humidity,
                id_zone=zone.id_zone
            )
        )

    if payload.airquality is not None:
        session.add(
            GasConcentration(
                gasconcentration=payload.airquality,
                id_zone=zone.id_zone
            )
        )

    if payload.movement is not None:
        session.add(
            MovementData(
                movement=payload.movement,
                id_zone=zone.id_zone
            )
        )

    if payload.noise is not None:
        session.add(
            NoiseData(
                noise=payload.noise,
                id_zone=zone.id_zone
            )
        )

    await session.commit()

    return {
        "status": "ok",
        "zone": payload.zone_name
    }

def gas_to_ps(gas_value: float, zone: str) -> int:
    if zone == "Laser":
        if gas_value < 45:
            return 1
        elif gas_value < 50:
            return 2
    else:
        if gas_value < 55:
            return 1
        elif gas_value < 60:
            return 2
    return 3

def noise_to_ps(noise_value: float) -> int:
    if noise_value <= 55:
        return 1
    elif noise_value <= 70:
        return 2
    else:
        return 3
    
def temperature_to_ps(temperature_value: float) -> int:
    if temperature_value <= 31:
        return 1
    else :
        return 2
  
def humidity_to_ps(humidity_value: float) -> int:
    if humidity_value <= 79:
        return 1
    else :
        return 2

@router.get("/last-by-zone/{zone_name}")
async def get_last_event_by_zone(
    zone_name: ZoneEnum,
    session: AsyncSession = Depends(get_session)
):
    ps = 0
    zone = (await session.execute(
        select(Zone).where(Zone.name == zone_name.value)
    )).scalars().first()

    if not zone:
        raise HTTPException(500, "Zone not found")

    temp = (await session.execute(
        select(TemperatureData)
        .where(TemperatureData.id_zone == zone.id_zone)
        .order_by(TemperatureData.datereceive.desc())
        .limit(1)
    )).scalars().first()
    
    if temp is not None:
        ps = temperature_to_ps(temp.temperature)

    humidity = (await session.execute(
        select(HumidityData)
        .where(HumidityData.id_zone == zone.id_zone)
        .order_by(HumidityData.datereceive.desc())
        .limit(1)
    )).scalars().first()
    
    if humidity is not None:
        ps = max(ps, humidity_to_ps(humidity.humidity))

    gas = (await session.execute(
        select(GasConcentration)
        .where(GasConcentration.id_zone == zone.id_zone)
        .order_by(GasConcentration.datereceive.desc())
        .limit(1)
    )).scalars().first()
    
    if gas is not None:
        ps = max(ps, gas_to_ps(gas.gasconcentration, zone))

    movements = (
        await session.execute(
            select(MovementData)
            .where(MovementData.id_zone == zone.id_zone)
            .order_by(MovementData.datereceive.desc())
            .limit(10)
        )
    ).scalars().all()

    movement = None
    movement_date = None

    if movements:
        true_count = sum(1 for m in movements if m.movement)
        movement = true_count >= 6
        movement_date = movements[0].datereceive

    noise = (await session.execute(
        select(NoiseData)
        .where(NoiseData.id_zone == zone.id_zone)
        .order_by(NoiseData.datereceive.desc())
        .limit(1)
    )).scalars().first()
    
    if noise is not None:
        ps = max(ps, noise_to_ps(noise.noise))

    await LedManagementAPI.call_led_api(ps)

    return {
        "zone": zone.name,

        "temperature": temp.temperature if temp else None,
        "temperature_date": temp.datereceive if temp else None,

        "humidity": humidity.humidity if humidity else None,
        "humidity_date": humidity.datereceive if humidity else None,

        "gasconcentration": gas.gasconcentration if gas else None,
        "gas_date": gas.datereceive if gas else None,

        "movement": movement,
        "movement_date": movement_date,

        "noise": noise.noise if noise else None,
        "noise_date": noise.datereceive if noise else None,
    }

    

@router.get("/stats", response_model=EventStats)
async def get_event_stats(session: AsyncSession = Depends(get_session)):
    temp_avg = await session.execute(
        func.avg(TemperatureData.temperature)
    )
    average_temperature = temp_avg.scalar()

    humidity_avg = await session.execute(
        func.avg(HumidityData.humidity)
    )
    average_humidity = humidity_avg.scalar()

    last_movement_subquery = (
        select(
            MovementData.id_zone,
            func.max(MovementData.datereceive).label("last_date")
        )
        .group_by(MovementData.id_zone)
        .subquery()
    )
    
    total_movements = (
        await session.execute(
            select(func.count())
            .select_from(MovementData)
            .join(
                last_movement_subquery,
                (MovementData.id_zone == last_movement_subquery.c.id_zone)
                & (MovementData.datereceive == last_movement_subquery.c.last_date)
            )
            .where(MovementData.movement.is_(True))
        )
    ).scalar()
    
    return EventStats(
        average_temperature=average_temperature,
        average_humidity=average_humidity,
        total_movements=total_movements
    )
