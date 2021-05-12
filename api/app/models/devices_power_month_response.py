from typing import List, Optional
from pydantic import BaseModel

class DevicePowerMonth(BaseModel):
    year: int
    month: int
    energy_wh: int

class DevicePowerUsageMonth(BaseModel):
    device_id: str
    child_id: Optional[str] = None
    name: str
    data: List[DevicePowerMonth] = []

class DevicesPowerMonthResponse(BaseModel):
    data: List[DevicePowerUsageMonth] = []
