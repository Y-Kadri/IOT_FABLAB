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
    async def call_led_api(zone_metrics: list[dict], timeout: float = DEFAULT_TIMEOUT) -> dict:
        global_ps = 0

        for metrics in zone_metrics:
            zone_name = metrics["zone"]

            if metrics.get("temperature") is not None:
                global_ps = max(global_ps,
                    LedManagementAPI.temperature_to_ps(metrics["temperature"])
                )

            if metrics.get("humidity") is not None:
                global_ps = max(global_ps,
                    LedManagementAPI.humidity_to_ps(metrics["humidity"])
                )

            if metrics.get("gas") is not None:
                global_ps = max(global_ps,
                    LedManagementAPI.gas_to_ps(metrics["gas"], zone_name)
                )

            if metrics.get("noise") is not None:
                global_ps = max(global_ps,
                    LedManagementAPI.noise_to_ps(metrics["noise"])
                )

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
