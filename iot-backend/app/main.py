from fastapi import FastAPI
from app.routes.events import router as events_router
from app.database import engine
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="IoT API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events_router)

@app.get("/")
def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("--------------------------------------\nConnected to PostgreSQL successfully\n--------------------------------------")
    except Exception as e:
        print("Error connecting to PostgreSQL:", e)
