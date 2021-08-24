from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from dependencies import get_current_user, auth_service, tplink_service
from models import UserAuthToken, User

router = APIRouter(
    # Changing this prefix will affect the oauth2_scheme
    prefix="/api/user",
    tags=["user"],
    dependencies=[],
    responses={404: {"description": "Not found"}}
)


def _third_party_login(username, password):
    successful_login = tplink_service.login(username, password)
    if not successful_login:
        # Failed to authenticate an existing user
        # The header here is required by OAuth2 Spec
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )


# Changing this route will affect the oauth2_scheme
@router.post("/token", response_model=UserAuthToken)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    _third_party_login(form_data.username, form_data.password)

    # We logged in successfully to the third party service, cache the user
    # and override any existing data for them since we already authenticated
    # them with the third-party service
    user = auth_service.add_user(form_data.username, form_data.password)

    access_token = auth_service.create_access_token(
        data={
            "sub": user.username
        }
    )

    # This return type and keys are required by OAuth2 Spec
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
