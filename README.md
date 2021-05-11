# tplink-kasa-ui

A simple frontend to observe and interact with Kasa devices. At this time, only viewing of electricity usage data for emeter-enabled Kasa devices is supported.

## Configuring the Project

Before running the project, you will need to follow the instructions for the API [here](api/README.md) to configure the API server's environment.

## Running the Project

To run, simply run the following command:
```
docker-compose up -d --build
```

You should now be able to view the site at [http://localhost](http://localhost)