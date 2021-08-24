# API

This project uses your Kasa credentials to make queries to the TP-Link Cloud API

## Prerequisites

### Uvicorn

Uvicorn is an HTTP server implementation.

Read more about Uvicorn [here](https://www.uvicorn.org/).

## Environment

You will need to setup environment variables with proper values in a `.env` file. There is a [`.env.example`](app/configuration/.env.example) provided as an example of what variables to specify.

Specifically, the `API_USER_ENCRYPTION_SECRET_KEY` variable can have a value containing the result of running this command on your machine: 

```sh
openssl rand -hex 32
```

The reason for using that command and explanations of the other variables can be found here: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/

## Running the API for Development

From the [app](app) folder, you can simply run `uvicorn main:app --reload` to serve the API in development mode.

The app's Swagger page will then be available at http://localhost:8000/docs

### Running as a Docker Container

You can leverage the [`Dockerfile`](Dockerfile) to run the API using the following command which will build the docker container image and run it:

```sh
docker build . -t apiserver

docker run -d \
    -p 80:80 \
    apiserver
```

The API will be available at: http://localhost/

This can be useful to leverage the same process as the GitHub Actions Workflow for packaging the Python code.
