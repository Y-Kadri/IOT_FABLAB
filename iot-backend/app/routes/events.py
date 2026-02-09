from sqlalchemy import select, func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.models import Zone, ZoneEnum, TemperatureData, GasConcentration, MovementData, NoiseData, HumidityData
from app.DTO.eventsDTO import EventCreate
from app.DTO.eventStats import EventStats
from app.services.led_management import LedManagementAPI
from app.logs.logger_settings import logger

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/")
async def create_event(payload: EventCreate, session: AsyncSession = Depends(get_session)):
    zone = (await session.execute(select(Zone).where(Zone.name == payload.zone_name))).scalars().first()
    if not zone:
        raise HTTPException(500, f"Zone '{payload.zone_name}' not found")

    if payload.temperature is not None:
        session.add(TemperatureData(temperature=payload.temperature, id_zone=zone.id_zone))
    if payload.humidity is not None:
        session.add(HumidityData(humidity=payload.humidity, id_zone=zone.id_zone))
    if payload.airquality is not None:
        session.add(GasConcentration(gasconcentration=payload.airquality, id_zone=zone.id_zone))
    if payload.movement is not None:
        session.add(MovementData(movement=payload.movement, id_zone=zone.id_zone))
    if payload.noise is not None:
        session.add(NoiseData(noise=payload.noise, id_zone=zone.id_zone))

    await session.commit()
    logger.info(f"Event created for zone '{payload.zone_name}'")
    return {"status": "ok", "zone": payload.zone_name}


@router.get("/last-by-zone/{zone_name}")
async def get_last_event_by_zone(zone_name: ZoneEnum, session: AsyncSession = Depends(get_session)):
    zone = (await session.execute(select(Zone).where(Zone.name == zone_name.value))).scalars().first()
    if not zone:
        raise HTTPException(500, "Zone not found")

    temp = (await session.execute(
        select(TemperatureData).where(TemperatureData.id_zone == zone.id_zone).order_by(TemperatureData.datereceive.desc()).limit(1)
    )).scalars().first()

    humidity = (await session.execute(
        select(HumidityData).where(HumidityData.id_zone == zone.id_zone).order_by(HumidityData.datereceive.desc()).limit(1)
    )).scalars().first()

    gas_values = (await session.execute(
        select(GasConcentration)
        .where(GasConcentration.id_zone == zone.id_zone)
        .order_by(GasConcentration.datereceive.desc())
        .limit(10)
    )).scalars().all()

    gas = None
    gas_date = None
    gas_avg = None

    if gas_values:
        gas_avg = sum(g.gasconcentration for g in gas_values) / len(gas_values)
        gas_date = gas_values[0].datereceive

    movements = (await session.execute(
        select(MovementData).where(MovementData.id_zone == zone.id_zone).order_by(MovementData.datereceive.desc()).limit(10)
    )).scalars().all()

    movement = None
    movement_date = None
    if movements:
        true_count = sum(1 for m in movements if m.movement)
        movement = true_count >= 6
        movement_date = movements[0].datereceive

    noise_values = (await session.execute(
        select(NoiseData)
        .where(NoiseData.id_zone == zone.id_zone)
        .order_by(NoiseData.datereceive.desc())
        .limit(5)
    )).scalars().all()

    noise = None
    noise_date = None

    if noise_values:
        noise = sum(n.noise for n in noise_values) / len(noise_values)
        noise_date = noise_values[0].datereceive
        
        
    zone_metrics = [{
        "zone": zone.name,
        "temperature": temp.temperature if temp else None,
        "humidity": humidity.humidity if humidity else None,
        "gas": gas_avg,
        "noise": noise
    }]

    led_result = await LedManagementAPI.call_led_api(zone_metrics)
    logger.info(f"LED API called from GET /last-by-zone/{zone_name.value}: {led_result}")

    return {
        "zone": zone.name,
        "temperature": temp.temperature if temp else None,
        "temperature_date": temp.datereceive if temp else None,
        "humidity": humidity.humidity if humidity else None,
        "humidity_date": humidity.datereceive if humidity else None,
        "gasconcentration": gas_avg,
        "gas_date": gas_date,
        "movement": movement,
        "movement_date": movement_date,
        "noise": noise,
        "noise_date": noise_date,
    }


@router.get("/stats", response_model=EventStats)
async def get_event_stats(session: AsyncSession = Depends(get_session)):

    zones = (await session.execute(select(Zone))).scalars().all()

    temperature_zone_avgs = []
    humidity_zone_avgs = []

    for zone in zones:

        # ---- TEMPERATURE : moyenne des X dernières valeurs ----
        temp_values = (await session.execute(
            select(TemperatureData)
            .where(TemperatureData.id_zone == zone.id_zone)
            .order_by(TemperatureData.datereceive.desc())
            .limit(1)
        )).scalars().all()

        if temp_values:
            temp_avg = sum(t.temperature for t in temp_values) / len(temp_values)
            temperature_zone_avgs.append(temp_avg)

        # ---- HUMIDITY : moyenne des X dernières valeurs ----
        humidity_values = (await session.execute(
            select(HumidityData)
            .where(HumidityData.id_zone == zone.id_zone)
            .order_by(HumidityData.datereceive.desc())
            .limit(1)
        )).scalars().all()

        if humidity_values:
            humidity_avg = sum(h.humidity for h in humidity_values) / len(humidity_values)
            humidity_zone_avgs.append(humidity_avg)

    # moyenne des moyennes par zone
    average_temperature = (
        sum(temperature_zone_avgs) / len(temperature_zone_avgs)
        if temperature_zone_avgs else None
    )

    average_humidity = (
        sum(humidity_zone_avgs) / len(humidity_zone_avgs)
        if humidity_zone_avgs else None
    )

    # mouvements (inchangé : dernier état par zone)
    last_movement_subquery = (
        select(
            MovementData.id_zone,
            func.max(MovementData.datereceive).label("last_date")
        )
        .group_by(MovementData.id_zone)
        .subquery()
    )

    total_movements = 0

    for zone in zones:
        movements = (await session.execute(
            select(MovementData)
            .where(MovementData.id_zone == zone.id_zone)
            .order_by(MovementData.datereceive.desc())
            .limit(10)
        )).scalars().all()

        if movements:
            true_count = sum(1 for m in movements if m.movement)

            if true_count >= 3:
                total_movements += 1


    return EventStats(
        average_temperature=average_temperature,
        average_humidity=average_humidity,
        total_movements=total_movements
    )
