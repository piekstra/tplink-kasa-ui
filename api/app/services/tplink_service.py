from tplinkcloud import TPLinkDeviceManager, TPLinkDeviceManagerPowerTools


class TPLinkService:

    def __init__(self, tplink_kasa_config):
        if (not tplink_kasa_config.username 
            or not tplink_kasa_config.password 
            or not tplink_kasa_config.api_url
        ):
            return
        
        self._device_manager = TPLinkDeviceManager(
            tplink_kasa_config.username, 
            tplink_kasa_config.password, 
            tplink_cloud_api_host=tplink_kasa_config.api_url,
            cache_devices=False,
            prefetch=False,
            verbose=True
        )

        self._device_power_tools = TPLinkDeviceManagerPowerTools(self._device_manager)

    def get_power_data_current(self, device_name=None, device_filter=None):
        devices_like = [device_name] if device_name else device_filter

        usage = self._device_power_tools.get_devices_power_usage_realtime(
            devices_like
        )

        return self._jsonify(usage)

    def get_power_data_day(self, device_name=None, device_filter=None):
        devices_like = [device_name] if device_name else device_filter

        usage = self._device_power_tools.get_devices_power_usage_day(
            devices_like
        )

        return self._jsonify(usage)

    def get_power_data_month(self, device_name=None, device_filter=None):
        devices_like = [device_name] if device_name else device_filter

        usage = self._device_power_tools.get_devices_power_usage_month(
            devices_like
        )

        return self._jsonify(usage)


    def _jsonify(self, data):
        if type(data) is list:
            result = []
            for item in data:
                result.append(self._jsonify(item))
            return result
        elif type(data) is dict:
            result = {}
            for key, value in data.items():
                result[key] = self._jsonify(value)
            return result
        elif type(data) in [int, float, str]:
            return data
        # classes
        elif hasattr(data, "__dict__"):
            data_vars = vars(data)            
            return self._jsonify(data_vars)
        # Enums
        elif hasattr(data, "name"):
            return data.name

        return None
