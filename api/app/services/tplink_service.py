from tplinkcloud import TPLinkDeviceManager, TPLinkDeviceManagerPowerTools


class TPLinkService:

    def __init__(self):
        self._default_api_url = 'https://wap.tplinkcloud.com'

    # username and password are ignored if auth_token is specified
    def _create_device_managers(self, username=None, password=None, auth_token=None, api_url=None):
        tplink_api_url = api_url if api_url else self._default_api_url
        self._device_manager = TPLinkDeviceManager(
            tplink_cloud_api_host=tplink_api_url,
            cache_devices=False,
            prefetch=False,
            verbose=True
        )
        self._device_power_tools = TPLinkDeviceManagerPowerTools(self._device_manager)

        if auth_token:
            self._device_manager.set_auth_token(auth_token)
        elif username and password:
            auth_token = self._device_manager.login(username, password)

        # We return the auth_token back if specified
        # If username and password were set, it will be the result of the login operation
        # for the device manager, which could be None
        # If none of username, password, auth_token were specified, it will be None
        return auth_token

    def set_auth_token(self, auth_token, api_url=None):
        return self._create_device_managers(
            auth_token=auth_token,
            api_url=api_url
        )

    def login(self, username, password, api_url=None):
        return self._create_device_managers(
            username=username,
            password=password,
            api_url=api_url
        )

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
