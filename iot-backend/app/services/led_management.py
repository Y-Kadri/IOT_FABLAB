import os
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Zone, TemperatureData, GasConcentration, NoiseData, HumidityData
from app.logs.logger_settings import logger

DEFAULT_TIMEOUT = 3.0
API_BASE_URL = "http://" + os.getenv("API_BASE_URL")

class LedManagementAPI:

    @staticmethod
    async def call_led_api(session: AsyncSession, timeout: float = DEFAULT_TIMEOUT) -> dict:
        zones = (await session.execute(select(Zone))).scalars().all()
        global_ps = 0

        for zone in zones:
            temp = (await session.execute(
                select(TemperatureData)
                .where(TemperatureData.id_zone == zone.id_zone)
                .order_by(TemperatureData.datereceive.desc())
                .limit(1)
            )).scalars().first()
            if temp:
                global_ps = max(global_ps, LedManagementAPI.temperature_to_ps(temp.temperature))

            humidity = (await session.execute(
                select(HumidityData)
                .where(HumidityData.id_zone == zone.id_zone)
                .order_by(HumidityData.datereceive.desc())
                .limit(1)
            )).scalars().first()
            if humidity:
                global_ps = max(global_ps, LedManagementAPI.humidity_to_ps(humidity.humidity))

            gas = (await session.execute(
                select(GasConcentration)
                .where(GasConcentration.id_zone == zone.id_zone)
                .order_by(GasConcentration.datereceive.desc())
                .limit(1)
            )).scalars().first()
            if gas:
                global_ps = max(global_ps, LedManagementAPI.gas_to_ps(gas.gasconcentration, zone.name))

            noise = (await session.execute(
                select(NoiseData)
                .where(NoiseData.id_zone == zone.id_zone)
                .order_by(NoiseData.datereceive.desc())
                .limit(1)
            )).scalars().first()
            if noise:
                global_ps = max(global_ps, LedManagementAPI.noise_to_ps(noise.noise))

        logger.info(f"Calling LED API with ps={global_ps}")

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{API_BASE_URL}/json/state",
                    json={"ps": global_ps}
                )
                response.raise_for_status()
                logger.info(f"LED API success: status={response.status_code} with ps value : {global_ps}")
                return {"success": True, "status": response.status_code, "response": response.json()}

        except httpx.RequestError as e:
            logger.error(f"LED API unreachable: {e}")
            return {"success": False, "error": "API_UNREACHABLE", "details": str(e)}

        except httpx.HTTPStatusError as e:
            logger.error(f"LED API error: status={e.response.status_code}, text={e.response.text}")
            return {"success": False, "error": "API_ERROR", "status": e.response.status_code, "details": e.response.text}

    @staticmethod
    def gas_to_ps(gas_value: float, zone: str) -> int:
        if zone == "Laser":
            if gas_value < 70: return 1
            elif gas_value < 80: return 2
        else:
            if gas_value < 55: return 1
            elif gas_value < 60: return 2
        return 3

    @staticmethod
    def noise_to_ps(noise_value: float) -> int:
        if noise_value < 65: return 1
        elif noise_value < 80: return 2
        return 3

    @staticmethod
    def temperature_to_ps(temperature_value: float) -> int:
        return 1 if temperature_value < 31 else 2

    @staticmethod
    def humidity_to_ps(humidity_value: float) -> int:
        return 1 if humidity_value < 79 else 2
