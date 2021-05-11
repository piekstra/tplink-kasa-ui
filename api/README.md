# API

This project uses your Kasa credentials to make queries to the TP-Link Cloud API

## Environment

You will need to setup environment variables with proper values in a `.env` file. There is a [`.env.example`](app/configuration/.env.example) provided as an example of what variables to specify.

## Running the API for Development

From the [app](app) folder, you can simply run `uvicorn main:app --reload` to serve the API in development mode.

The app's Swagger page will then be available at http://localhost:8000/docs
