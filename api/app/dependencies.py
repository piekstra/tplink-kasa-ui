from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pydantic import BaseModel
from typing import Optional

from services import TPLinkService
from services import AuthService, UserDatabase
from configuration import Configuration

# Note that this has to have parity with the `users` router's `token` endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/token")
user_db = UserDatabase()
config = Configuration()
auth_service = AuthService(
    config.user_auth.encryption_secret_key,
    config.user_auth.access_token_expire_minutes,
    config.user_auth.encryption_token_algorithm,
    config.user_auth.encryption_password_hash_algorithm,
    user_db
)
tplink_service = TPLinkService()


class UserAuthTokenData(BaseModel):
    username: Optional[str] = None


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_service.decode_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = UserAuthTokenData(username=username)
        # At some point in the future, there can be other uses for
        # the token's data
    # Consider adding logging and catching more granular exceptions
    # such as JWTClaimsError
    except JWTError:
        raise credentials_exception
    user = user_db.get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user
