export class CurrentPowerData {
    date: Date = new Date();
    [key: string]: number | Date;
}

export interface DayPowerData {
    date: Date;
    [key: string]: number | Date;
}

export default class DevicePowerManager {

    static fetchCurrentPowerData(deviceAlias: string, onDataReceive: (data: CurrentPowerData) => void) {
        // Simple GET request using fetch
        console.log(`Getting current power data for devices like ${deviceAlias}`);
        fetch(`/api/power/devices/current?named=${deviceAlias}`)
            .then((response: any) => response.json())
            .then((data: any) => {
                console.log('GOT CURRENT POWER DATA!');
                console.log(data)
                const latestPowerData = new CurrentPowerData();
                data.data.forEach((devicePower: any) => {
                    let powerData = devicePower.data.power_mw / 1000
                    if (powerData === Infinity) {
                        powerData = 0;
                    }
                    latestPowerData[devicePower.name] = powerData
                });
                onDataReceive(latestPowerData);
            });
    }

    static fetchDailyPowerData(deviceAlias: string, onDataReceive: (data: Array<DayPowerData>, keys: Array<string>) => void) {
        // Simple GET request using fetch
        console.log(`Getting day power data for devices like ${deviceAlias}`);
        fetch(`/api/power/devices/day?named=${deviceAlias}`)
            .then((response: any) => response.json())
            .then((data: any) => {
                console.log('GOT DAY POWER DATA!');
                console.log(data)
                let powerData: {[key: number]: DayPowerData} = {};
                let keys = Array<string>();
                data.data.forEach((devicePower: any) => {
                    keys.push(devicePower.name);
                    devicePower.data.forEach((dayPower: any) => {
                        let date = new Date(
                            dayPower.year,
                            dayPower.month - 1,
                            dayPower.day
                        );
                        let timestamp = date.getTime();
                        if (!(timestamp in powerData)) {
                            powerData[timestamp] = {
                                date: date
                            }
                        }
                        powerData[timestamp][devicePower.name] = dayPower.energy_wh / 24;
                    });
                });

                // Add 0-values
                for (const timestamp in powerData) {
                    keys.forEach(deviceName => {
                        if (!(deviceName in powerData[timestamp])) {
                            powerData[timestamp][deviceName] = 0;
                        }
                    })
                }

                // Because the data for the most-recent day (today) 
                // will almost always be partial, slice it off
                let values = Object.values(powerData).slice(0, -1);
                onDataReceive(values, keys);
            });
    }
}