import time
from flask import Flask, request

from .configuration import Configuration
from .tplink_service import TPLinkService, TIME_FILTERS

app = Flask(__name__)
config = Configuration()
tplink_service = TPLinkService(config.tplink_kasa)

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

# Example url params would be "?named=plug&time=current"
# Options for time are:
#   current
#   day
#   month
@app.route('/api/power/devices', methods = ['GET'])
def get_devices_power():
    device_filter = request.args.get('named')
    time_filter = request.args.get('time')
    if time_filter:
        if time_filter not in TIME_FILTERS:
            return {
                'error': f'Invalid filter {time_filter}. Must be one of {TIME_FILTERS}'
            }
    else:
        return {
            'error': 'URL Parameter "time" required'
        }

    power_data = tplink_service.get_power_data(
        device_filter=device_filter, 
        time_filter=time_filter
    )
    
    return  {
        'data': power_data
    }

# Example url params would be "?time=current"
# Options for time are:
#   current
#   day
#   month
@app.route('/api/power/device/<device_name>', methods = ['GET'])
def get_device_power(device_name):
    time_filter = request.args.get('time')
    if time_filter:
        if time_filter not in TIME_FILTERS:
            return {
                'error': f'Invalid filter {time_filter}. Must be one of {TIME_FILTERS}'
            }
    else:
        return {
            'error': 'URL Parameter "time" required'
        }

    power_data = tplink_service.get_power_data(
        device_name=device_name, 
        time_filter=time_filter
    )

    if power_data:
        return {
            'data': power_data
        }
    
    return {
        'data': None,
        'message': f'No data found for {device_name}'
    }
