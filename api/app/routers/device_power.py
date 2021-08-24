import json
from fastapi import APIRouter
from fastapi import Depends

from dependencies import get_current_user
from dependencies import tplink_service
from dependencies import root_path
from models import User
from models import DevicesPowerCurrentResponse
from models import DevicesPowerDayResponse
from models import DevicesPowerMonthResponse

router = APIRouter(
    prefix=f'{root_path}/power/devices',
    tags=['power'],
    dependencies=[Depends(get_current_user)],
    responses={404: {'description': 'Not found'}}
)


@router.get('/current', response_model=DevicesPowerCurrentResponse)
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


@router.get('/day', response_model=DevicesPowerDayResponse)
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


@router.get('/month', response_model=DevicesPowerMonthResponse)
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
