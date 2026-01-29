from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Zone, Event, ZoneEnum
from app.DTO.eventsDTO import EventCreate

router = APIRouter()


router = APIRouter(prefix="/events", tags=["events"])

from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Zone, Event, ZoneEnum
from app.DTO.eventsDTO import EventCreate

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=Event)
async def create_event(
    payload: EventCreate,
    session: AsyncSession = Depends(get_session)
):
    stmt = select(Zone).where(Zone.name == payload.zone_name)
    result = await session.execute(stmt)
    zone = result.scalars().first()

    if not zone:
        raise HTTPException(
            status_code=404,
            detail=f"Zone '{payload.zone_name}' not found"
        )

    event = Event(
        temperature=payload.temperature,
        airquality=payload.airquality,
        humidity=payload.humidity,
        movement=payload.movement,
        noise=payload.noise,
        id_zone=zone.id_zone
    )

    session.add(event)
    await session.commit()
    await session.refresh(event)

    return event


@router.get("/last-by-zone/{zone_name}", response_model=Event | None)
async def get_last_event_by_zone(
    zone_name: ZoneEnum,
    session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Event)
        .join(Zone, Event.id_zone == Zone.id_zone)
        .where(Zone.name == zone_name.value)
        .order_by(Event.datereceive.desc())
        .limit(1)
    )

    result = await session.execute(stmt)
    event = result.scalars().first()

    return event
