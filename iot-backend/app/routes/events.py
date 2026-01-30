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

router = APIRouter()


router = APIRouter(prefix="/events", tags=["events"])


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


@router.get("/last-by-zone/{zone_name}")
async def get_last_event_by_zone(
    zone_name: ZoneEnum,
    session: AsyncSession = Depends(get_session)
):
    zone = (await session.execute(
        select(Zone).where(Zone.name == zone_name.value)
    )).scalars().first()

    if not zone:
        raise HTTPException(404, "Zone not found")

    temp = (await session.execute(
        select(TemperatureData)
        .where(TemperatureData.id_zone == zone.id_zone)
        .order_by(TemperatureData.datereceive.desc())
        .limit(1)
    )).scalars().first()

    humidity = (await session.execute(
        select(HumidityData)
        .where(HumidityData.id_zone == zone.id_zone)
        .order_by(HumidityData.datereceive.desc())
        .limit(1)
    )).scalars().first()

    gas = (await session.execute(
        select(GasConcentration)
        .where(GasConcentration.id_zone == zone.id_zone)
        .order_by(GasConcentration.datereceive.desc())
        .limit(1)
    )).scalars().first()

    movement = (await session.execute(
        select(MovementData)
        .where(MovementData.id_zone == zone.id_zone)
        .order_by(MovementData.datereceive.desc())
        .limit(1)
    )).scalars().first()

    noise = (await session.execute(
        select(NoiseData)
        .where(NoiseData.id_zone == zone.id_zone)
        .order_by(NoiseData.datereceive.desc())
        .limit(1)
    )).scalars().first()

    return {
        "zone": zone.name,

        "temperature": temp.temperature if temp else None,
        "temperature_date": temp.datereceive if temp else None,

        "humidity": humidity.humidity if humidity else None,
        "humidity_date": humidity.datereceive if humidity else None,

        "gasconcentration": gas.gasconcentration if gas else None,
        "gas_date": gas.datereceive if gas else None,

        "movement": movement.movement if movement else None,
        "movement_date": movement.datereceive if movement else None,

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

    total_movement_res = await session.execute(
        func.count(MovementData.id_movement)
    )
    total_movements = total_movement_res.scalar()

    return EventStats(
        average_temperature=average_temperature,
        average_humidity=average_humidity,
        total_movements=total_movements
    )
