from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from .user_database import UserDatabase


class AuthService:

    def __init__(
        self,
        api_user_encryption_secret_key,
        api_user_access_token_expire_minutes,
        api_user_encryption_token_algorithm,
        api_user_encryption_password_hash_algorithm,
        user_db: UserDatabase
    ):
        self._ALGORITHM = api_user_encryption_token_algorithm
        self._ACCESS_TOKEN_EXPIRE_MINUTES = api_user_access_token_expire_minutes
        self._SECRET_KEY = api_user_encryption_secret_key
        self._password_context = CryptContext(
            schemes=[api_user_encryption_password_hash_algorithm],
            deprecated="auto"
        )
        self._user_db = user_db

    def get_token_expiration(self):
        return timedelta(minutes=self._ACCESS_TOKEN_EXPIRE_MINUTES)

    def decode_token(self, token):
        return jwt.decode(token, self._SECRET_KEY, algorithms=[self._ALGORITHM])

    def verify_password(self, plain_password, hashed_password):
        return self._password_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return self._password_context.hash(password)

    # Returns False if the user was not found in the in-memory cache
    # Returns False if they were found but their password did not match
    # Returns the User if they were found and their password matched
    def authenticate_user(self, username: str, password: str):
        user = self._user_db.get_user(username)
        if not user:
            return False
        if not self.verify_password(password, user.hashed_password):
            return False
        return user

    # Note this will intentionally override existing users with the
    # same username
    def add_user(self, username: str, password: str):
        hashed_password = self.get_password_hash(password)
        user = self._user_db.add_user(username, hashed_password)
        return user

    def create_access_token(self, data: dict):
        expires_delta = self.get_token_expiration()
        to_encode = data.copy()
        expire = datetime.utcnow() + expires_delta
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self._SECRET_KEY, algorithm=self._ALGORITHM)
        return encoded_jwt
