from typing import List, Optional
from pydantic import BaseModel

class DevicePowerDay(BaseModel):
    year: int
    month: int
    day: int
    energy_wh: int

class DevicePowerUsageDay(BaseModel):
    device_id: str
    child_id: Optional[str] = None
    name: str
    data: List[DevicePowerDay] = []

class DevicesPowerDayResponse(BaseModel):
    data: List[DevicePowerUsageDay] = []
