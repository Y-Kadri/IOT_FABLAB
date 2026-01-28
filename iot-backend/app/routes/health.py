from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database import get_session

router = APIRouter()

@router.get("/health/db")
async def health_db(session: AsyncSession = Depends(get_session)):
    result = await session.exec(text("SELECT 1"))
    return {"database": "ok", "result": result.first()}
