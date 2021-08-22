import time
import json
from fastapi import FastAPI, Depends

from models import DevicesPowerCurrentResponse
from models import DevicesPowerDayResponse
from models import DevicesPowerMonthResponse
from models import User
from routers import user
from dependencies import tplink_service, get_current_user

app = FastAPI()
app.include_router(user.router)


@app.get('/api/time')
def get_current_time():
    return {'time': time.time()}


@app.get('/api/power/devices/current', response_model=DevicesPowerCurrentResponse)
def get_devices_power_current(named: str, current_user: User = Depends(get_current_user)):
    # Eventually (when this API is hosted for use by multiple users)
    # we will need to leverage data about the current_user to
    # make sure we are getting power data for them specifically
    power_data = tplink_service.get_power_data_current(
        device_filter=named
    )

    print(json.dumps(power_data))

    return {
        'data': power_data
    }


@app.get('/api/power/devices/day', response_model=DevicesPowerDayResponse)
def get_devices_power_day(named: str, current_user: User = Depends(get_current_user)):
    # Eventually (when this API is hosted for use by multiple users)
    # we will need to leverage data about the current_user to
    # make sure we are getting power data for them specifically
    power_data = tplink_service.get_power_data_day(
        device_filter=named
    )

    return {
        'data': power_data
    }


@app.get('/api/power/devices/month', response_model=DevicesPowerMonthResponse)
def get_devices_power_month(named: str, current_user: User = Depends(get_current_user)):
    # Eventually (when this API is hosted for use by multiple users)
    # we will need to leverage data about the current_user to
    # make sure we are getting power data for them specifically
    power_data = tplink_service.get_power_data_month(
        device_filter=named
    )

    return {
        'data': power_data
    }
