import os
import pytest
import requests
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter


@pytest.fixture(scope='module')
def client():
    s = requests.Session()

    # Sleeps for 0.5, 1.0, 2.0, ...
    retries = Retry(
        total=20,
        backoff_factor=0.1
    )

    s.mount(os.environ.get('API_HOST'), HTTPAdapter(max_retries=retries))
    return s


@pytest.mark.usefixtures('client')
class TestAPI(object):

    def _request(self, client, method, path):
        return client.request(
            method=method,
            url=os.environ.get('API_HOST') + '/api' + path
        )

    def test_get_time(self, client):
        response = self._request(
            client,
            method='GET',
            path='/time',
        )

        assert response.status_code == 200
        response_json = response.json()
        assert response_json is not None
        assert response_json.get('time') > 0
