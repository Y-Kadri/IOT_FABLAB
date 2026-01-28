from fastapi import FastAPI
from app.routes.sensors import router as sensor_router

app = FastAPI(
    title="IoT API",
    version="1.0.0",
)

app.include_router(sensor_router)

@app.get("/")
def health():
    return {"status": "ok"}
