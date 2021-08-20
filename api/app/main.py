import time
import json
from fastapi import FastAPI

from configuration import Configuration
from services import TPLinkService
from models import DevicesPowerCurrentResponse
from models import DevicesPowerDayResponse
from models import DevicesPowerMonthResponse

# TODO support login / auth capability and account view to see current Kasa credentials or change them

# Note that root_path is not implemented via FastAPI(root_path='route') intentionally.
# This is due to the behavior of Uvicorn in overwriting the root_path.
# https://fastapi.tiangolo.com/advanced/behind-a-proxy/
root_path="/api/v1"
app = FastAPI()
config = Configuration()
tplink_service = TPLinkService(config.tplink_kasa)

@app.get(f'{root_path}/time')
def get_current_time():
    return {'time': time.time()}

@app.get(f'{root_path}/power/devices/current', response_model=DevicesPowerCurrentResponse)
def get_devices_power_current(named: str):

    power_data = tplink_service.get_power_data_current(
        device_filter=named
    )

    print(json.dumps(power_data))
    
    return {
        'data': power_data
    }

@app.get(f'{root_path}/power/devices/day', response_model=DevicesPowerDayResponse)
def get_devices_power_day(named: str):

    power_data = tplink_service.get_power_data_day(
        device_filter=named
    )
    
    return {
        'data': power_data
    }

@app.get(f'{root_path}/power/devices/month', response_model=DevicesPowerMonthResponse)
def get_devices_power_month(named: str):

    power_data = tplink_service.get_power_data_month(
        device_filter=named
    )
    
    return {
        'data': power_data
    }
