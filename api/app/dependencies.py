from fastapi.security import OAuth2PasswordBearer
from configuration import Configuration

root_path = '/api/v1'

# Note that this has to have parity with the `users` router's `token` endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f'{root_path}/user/token')
config = Configuration()
