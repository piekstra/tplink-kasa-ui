import os
import pytest
import requests


@pytest.fixture(scope='module')
def client():
    s = requests.Session()
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
