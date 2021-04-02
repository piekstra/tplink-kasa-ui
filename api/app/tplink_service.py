import json
from enum import Enum
from datetime import datetime
from tplinkcloud import TPLinkDeviceManager

class PowerTimeType(Enum):
    current = 1
    day = 2
    month = 3

    def __str__(self):
        return self.name

TIME_FILTERS = [
    PowerTimeType.current.name,
    PowerTimeType.day.name,
    PowerTimeType.month.name
]

class TPLinkService:

    def __init__(self, tplink_kasa_config):
        self.MAX_DEVICE_DATA_GATHER_ATTEMPTS = 3
        
        self._device_manager = TPLinkDeviceManager(
            tplink_kasa_config.username, 
            tplink_kasa_config.password, 
            tplink_cloud_api_host=tplink_kasa_config.api_url
        )
    
    def get_power_data(self, device_name=None, device_filter=None, time_filter=None):
        if device_name:
            devices = [self._device_manager.find_device(device_name)]
            print(f'Found TP Link device matching the search for: "{device_name}"')
        elif device_filter:
            devices = self._device_manager.find_devices(device_filter)
            print(f'Found {len(devices)} TP Link devices matching the search for devices like: "{device_filter}"')
        else:
            devices = self._device_manager.get_devices()
            print(f'Found {len(devices)} TP Link devices')
        
        all_data = {}
        for device in devices:
            # Sice we are collecting power data, we need to ignore devices without it
            if not device or not device.has_emeter():
                continue

            data = None
            data_fetch_attempts = 0
            while not data and data_fetch_attempts < self.MAX_DEVICE_DATA_GATHER_ATTEMPTS:
                data = self._get_device_data(device, time_filter)
                data_fetch_attempts += 1

            if not data:
                print(f'Failed to get "{time_filter}" data after {self.MAX_DEVICE_DATA_GATHER_ATTEMPTS} '\
                    f'attempts for device: {device.get_alias()}')
                continue            
            print(f'Finished getting "{time_filter}" data for device: {device.get_alias()}')

            all_data[device.device_id] = {
                'name': device.get_alias(),
                'data': data
            }

        return all_data

    def _get_device_data(self, device, time_filter):
        print(f'Getting "{time_filter}" data for device: {device.get_alias()}')

        usage_data = None
        if time_filter == PowerTimeType.current.name:
            usage_data = device.get_power_usage_realtime()
        elif time_filter == PowerTimeType.day.name:
            today = datetime.today()
            # current month
            usage_data = device.get_power_usage_day(today.year, today.month)
            # past month if available
            if today.month > 1:
                month = today.month - 1
                year = today.year
            else:
                month = 12
                year = today.year - 1
            past_usage_data = device.get_power_usage_day(year, month)
            if past_usage_data:
                usage_data.extend(past_usage_data)
            usage_data.sort(key=lambda x: datetime(year=x.year, month=x.month, day=x.day))
        elif time_filter == PowerTimeType.month.name:
            today = datetime.today()
            usage_data = device.get_power_usage_month(today.year)
        
        if usage_data:
            return self._jsonify(usage_data)

        return None
    
    def _jsonify(self, data):
        if type(data) is list:
            result = []
            for item in data:
                result.append(self._jsonify(item))
            return result
        else:
            return vars(data) if hasattr(data, "__dict__") else data.name if hasattr(data, "name") else None        
