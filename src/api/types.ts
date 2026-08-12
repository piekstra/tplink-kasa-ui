/**
 * Vendor-neutral device model. Components consume only these types; vendor
 * specifics live in provider implementations (tplink.ts today). A future
 * home-ui adds providers (govee, roomba, ...) and a registry keyed by
 * `vendor` without touching components.
 */

export type Vendor = 'tplink';

export type DeviceKind = 'plug' | 'strip' | 'strip-outlet' | 'bulb' | 'switch' | 'unknown';

export interface Device {
  /** Stable unique key across vendors, usable in URLs. */
  id: string;
  vendor: Vendor;
  name: string;
  model: string;
  kind: DeviceKind;
  isOnline: boolean;
  /** null when unknown (offline, or the vendor couldn't read state) */
  isOn: boolean | null;
  capabilities: {
    switchable: boolean;
    emeter: boolean;
  };
  rssi: number | null;
}

export interface DeviceDetail extends Device {
  raw: Record<string, unknown> | null;
  network: Record<string, unknown> | null;
}

export interface PowerReading {
  deviceId: string;
  name: string;
  /** Instantaneous draw in watts; null when the device was unreachable */
  watts: number | null;
}

export interface EnergySample {
  date: Date;
  energyWh: number;
}

export interface DeviceEnergy {
  deviceId: string;
  name: string;
  samples: EnergySample[];
}

export type PowerAction = 'on' | 'off' | 'toggle';

export interface PowerResult {
  deviceId: string;
  isOn: boolean | null;
}

export interface DeviceProvider {
  vendor: Vendor;
  listDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<DeviceDetail>;
  setPower(id: string, action: PowerAction): Promise<PowerResult>;
  getCurrentPower(nameFilter?: string): Promise<PowerReading[]>;
  getDailyEnergy(nameFilter?: string): Promise<DeviceEnergy[]>;
  getMonthlyEnergy(nameFilter?: string): Promise<DeviceEnergy[]>;
}
