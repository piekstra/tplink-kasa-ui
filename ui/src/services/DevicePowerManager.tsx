import ApiConfigService from 'src/services/ApiConfigService';

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
        console.log(data);
        const latestPowerData = new CurrentPowerData();
        data.data.forEach((devicePower: any) => {
          let powerData = devicePower.data.power_mw / 1000;
          if (powerData === Infinity) {
            powerData = 0;
          }
          latestPowerData[devicePower.name] = powerData;
        });
        onDataReceive(latestPowerData);
      });
  }

  static fetchDailyPowerData(
    deviceAlias: string,
    onDataReceive: (data: Array<DayPowerData>, keys: Array<string>) => void
  ) {
    // Simple GET request using fetch
    console.log(`Getting day power data for devices like ${deviceAlias}`);
    fetch(`${ApiConfigService.ROOT_PATH}/power/devices/day?named=${deviceAlias}`)
      .then((response: any) => response.json())
      .then((data: any) => {
        console.log('GOT DAY POWER DATA!');
        console.log(data);
        const powerData: { [key: number]: DayPowerData } = {};
        const keys = Array<string>();
        data.data.forEach((devicePower: any) => {
          keys.push(devicePower.name);
          devicePower.data.forEach((dayPower: any) => {
            const date = new Date(dayPower.year, dayPower.month - 1, dayPower.day);
            const timestamp = date.getTime();
            if (!(timestamp in powerData)) {
              powerData[timestamp] = {
                date,
              };
            }
            powerData[timestamp][devicePower.name] = dayPower.energy_wh / 24;
          });
        });

        // Add 0-values
        // TODO: fix for in loop
        // eslint-disable-next-line guard-for-in
        // eslint-disable-next-line no-restricted-syntax
        for (const timestamp in powerData) {
          keys.forEach((deviceName) => {
            if (!(deviceName in powerData[timestamp])) {
              powerData[timestamp][deviceName] = 0;
            }
          });
        }

        // Make sure that the data is sorted by timestamp
        const orderedPowerData = Object.keys(powerData)
          .map(Number)
          .sort()
          .reduce((obj: { [key: number]: DayPowerData }, key: number) => {
            // eslint-disable-next-line no-param-reassign
            obj[key] = powerData[key];
            return obj;
          }, {});

        // Because the data for the most-recent day (today)
        // will almost always be partial, slice it off
        const values = Object.values(orderedPowerData).slice(0, -1);
        onDataReceive(values, keys);
      });
  }

  static fetchMonthlyPowerData(
    deviceAlias: string,
    onDataReceive: (data: Array<DayPowerData>, keys: Array<string>) => void
  ) {
    // Simple GET request using fetch
    console.log(`Getting month power data for devices like ${deviceAlias}`);
    fetch(`${ApiConfigService.ROOT_PATH}/power/devices/month?named=${deviceAlias}`)
      .then((response: any) => response.json())
      .then((data: any) => {
        console.log('GOT MONTH POWER DATA!');
        console.log(data);
        const powerData: { [key: number]: DayPowerData } = {};
        const keys = Array<string>();
        data.data.forEach((devicePower: any) => {
          keys.push(devicePower.name);
          devicePower.data.forEach((monthPower: any) => {
            // For creating a Date, month is 0-indexed (January is 0, February is 1, etc)
            // The data we receive is 1-indexed so we have to subtract 1
            const date = new Date(monthPower.year, monthPower.month - 1);
            // In order to get the current month's days, use the raw month value (1 month ahead)
            // with days set to 0 which gives us a date that is the last day
            // of the previous month (the month we actually care about)
            const daysInMonth = new Date(monthPower.year, monthPower.month, 0).getDate();
            const timestamp = date.getTime();
            if (!(timestamp in powerData)) {
              powerData[timestamp] = {
                date,
              };
            }
            powerData[timestamp][devicePower.name] = monthPower.energy_wh / 24 / daysInMonth;
          });
        });

        // Add 0-values
        // TODO: fix for in loop
        // eslint-disable-next-line guard-for-in
        // eslint-disable-next-line no-restricted-syntax
        for (const timestamp in powerData) {
          keys.forEach((deviceName) => {
            if (!(deviceName in powerData[timestamp])) {
              powerData[timestamp][deviceName] = 0;
            }
          });
        }

        // Because the data for the most-recent month (this month)
        // will almost always be partial, slice it off
        const values = Object.values(powerData)
          .sort((a, b) => (a.date > b.date ? 1 : -1))
          .slice(0, -1);
        onDataReceive(values, keys);
      });
  }
}
