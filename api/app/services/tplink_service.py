from tplinkcloud import TPLinkDeviceManager, TPLinkDeviceManagerPowerTools


class TPLinkService:

    def login(self, username, password, api_url='https://wap.tplinkcloud.com'):
        self._device_manager = TPLinkDeviceManager(
            username,
            password,
            tplink_cloud_api_host=api_url,
            cache_devices=False,
            prefetch=False,
            verbose=True
        )
        # We aren't supposed to access this directly, but currently there's no other
        # officially supported way to determine if the login failed
        if self._device_manager._auth_token is None:
            return False

        self._device_power_tools = TPLinkDeviceManagerPowerTools(self._device_manager)

        return True

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
