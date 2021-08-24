import os
from dotenv import load_dotenv


class Configuration:

    def __init__(self, file_path=None):
        load_dotenv()
        self.user_auth = UserAuth()


class UserAuth:

    def __init__(self):
        self.encryption_secret_key = os.environ.get('API_USER_ENCRYPTION_SECRET_KEY')
        self.access_token_expire_minutes = int(os.environ.get('API_USER_ACCESS_TOKEN_EXPIRE_MINUTES'))
        self.encryption_token_algorithm = os.environ.get('API_USER_ENCRYPTION_TOKEN_ALGORITHM')
        self.encryption_password_hash_algorithm = os.environ.get('API_USER_ENCRYPTION_PASSWORD_HASH_ALGORITHM')
