import time
from fastapi import FastAPI

from routers import user
from routers import device_power

from dependencies import root_path

# TODO support login / auth capability and account view to see current Kasa credentials or change them

# Note that root_path is not implemented via FastAPI(root_path='route') intentionally.
# This is due to the behavior of Uvicorn in overwriting the root_path.
# https://fastapi.tiangolo.com/advanced/behind-a-proxy/
app = FastAPI()
app.include_router(user.router)
app.include_router(device_power.router)


@app.get(f'{root_path}/time')
def get_current_time():
    return {'time': time.time()}
