from models import User


class UserInDB(User):
    hashed_password: str


class UserDatabase:

    def __init__(self):
        # Empty cache to start
        self._user_cache = {}

    def get_user(self, username: str):
        if username in self._user_cache:
            user_dict = self._user_cache[username]
            return UserInDB(**user_dict)

    # Note this will intentionally override existing cached users with the
    # same username
    def add_user(self, username, hashed_password):
        self._user_cache[username] = UserInDB(
            username=username,
            hashed_password=hashed_password
        ).dict()

        return self.get_user(username)
