from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Zone, Event, ZoneEnum

router = APIRouter()


router = APIRouter(prefix="/events", tags=["events"])

@router.get("/last-by-zone/{zone_name}")
async def get_last_event_by_zone(
    zone_name: str,
    session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Event)
        .join(Zone, Event.id_zone == Zone.id_zone)
        .where(Zone.name == zone_name)
        .order_by(Event.datereceive.desc())
        .limit(1)
    )

    result = await session.execute(stmt)
    
    print("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    print(stmt)
    event = result.scalars().first()

    return event
