from typing import List, Optional
from pydantic import BaseModel

class DevicePowerCurrent(BaseModel):
    voltage_mv: int
    current_ma: int
    power_mw: int
    total_wh: int

class DevicePowerUsageCurrent(BaseModel):
    device_id: str
    child_id: Optional[str] = None
    name: str
    data: DevicePowerCurrent

class DevicesPowerCurrentResponse(BaseModel):
    data: List[DevicePowerUsageCurrent] = []
