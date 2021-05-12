import os
from dotenv import load_dotenv


class Configuration:

    def __init__(self, file_path=None):
        load_dotenv()
        self.tplink_kasa = TPLinkKasa()

class TPLinkKasa:

    def __init__(self):
        self.username = os.environ.get('TPLINK_KASA_USERNAME')
        self.password = os.environ.get('TPLINK_KASA_PASSWORD')
        self.api_url = os.environ.get('TPLINK_KASA_API_URL')
