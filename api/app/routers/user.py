from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from dependencies import root_path
from dependencies import oauth2_scheme
from services import TPLinkService
from models import UserAuthToken

router = APIRouter(
    # Changing this prefix will affect the oauth2_scheme
    prefix=f'{root_path}/user',
    tags=['user'],
    dependencies=[],
    responses={404: {'description': 'Not found'}}
)


# Changing this route will affect the oauth2_scheme
@router.post('/token', response_model=UserAuthToken)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    tplink_service = TPLinkService()
    auth_token = tplink_service.login(form_data.username, form_data.password)
    if not auth_token:
        # Failed to authenticate an existing user
        # The header here is required by OAuth2 Spec
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={
                'WWW-Authenticate': 'Bearer'
            },
        )

    # This return type and keys are required by OAuth2 Spec
    return {
        'access_token': auth_token,
        'token_type': 'bearer'
    }


@router.get('/token', response_model=UserAuthToken)
async def show_token(token: str = Depends(oauth2_scheme)):
    return {
        'access_token': token,
        'token_type': 'bearer'
    }
