# tplink-kasa-ui

A simple frontend to observe and interact with Kasa devices. At this time, only viewing of electricity usage data for emeter-enabled Kasa devices is supported.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## API

The backend API server for this project is maintained here: https://github.com/piekstra/tplinkcloud-service

## Prerequisites

* [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Project

To run, simply run the following command:
```
docker-compose up -d --build
```

You should now be able to view the site at [http://localhost](http://localhost)

## Available Scripts for Development Purposes

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Linting

_For automatic linting_

### `npm run lint:fix`

Alternatively, commit from the UI directory
