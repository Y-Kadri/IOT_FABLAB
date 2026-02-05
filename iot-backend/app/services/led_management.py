import os
import httpx
from typing import Optional

DEFAULT_TIMEOUT = 3.0
API_BASE_URL = "http://" + os.getenv("API_BASE_URL")
class LedManagementAPI:

    @staticmethod
    async def call_led_api(ps: int, timeout: float = DEFAULT_TIMEOUT) -> dict:
        print(f"Calling LED API with ps={ps}")
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{API_BASE_URL}/json/state",
                    json={"ps": ps}
                )
                response.raise_for_status()

                return {
                    "success": True,
                    "status": response.status_code,
                    "response": response.json()
                }

        except httpx.RequestError as e:
            return {
                "success": False,
                "error": "API_UNREACHABLE",
                "details": str(e)
            }

        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "error": "API_ERROR",
                "status": e.response.status_code,
                "details": e.response.text
            }
