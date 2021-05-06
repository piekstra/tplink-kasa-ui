export class CurrentPowerData {
    timestamp: number = new Date().getTime();
    [key: string]: number;
}

export default class DevicePowerManager {

    static fetchCurrentPowerData(deviceAlias: string, onDataReceive: (data: CurrentPowerData) => void) {
        // Simple GET request using fetch
        console.log('Getting current power data');
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
}