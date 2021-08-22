import time
from fastapi import FastAPI

from routers import user
from routers import device_power

app = FastAPI()
app.include_router(user.router)
app.include_router(device_power.router)


@app.get('/api/time')
def get_current_time():
    return {'time': time.time()}
