from pydantic import BaseModel


class UserAuthToken(BaseModel):
    access_token: str
    token_type: str
