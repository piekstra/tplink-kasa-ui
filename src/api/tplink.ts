import { http } from './http';
import type {
  Device,
  DeviceDetail,
  DeviceEnergy,
  DeviceKind,
  DeviceProvider,
  PowerAction,
  PowerReading,
  PowerResult,
} from './types';

// --- Service DTOs (tplinkcloud-service /api/v1) ---

interface TplinkDeviceSummary {
  device_id: string;
  child_id: string | null;
  alias: string;
  model: string;
  device_type: string;
  is_online: boolean;
  is_on: boolean | null;
  has_emeter: boolean;
  rssi: number | null;
}

interface TplinkDeviceDetail extends TplinkDeviceSummary {
  sys_info: Record<string, unknown> | null;
  net_info: Record<string, unknown> | null;
}

interface TplinkPowerCurrent {
  device_id: string;
  child_id?: string | null;
  name: string;
  data: { power_mw: number } | null;
}

interface TplinkEnergyUsage {
  device_id: string;
  child_id?: string | null;
  name: string;
  data: { year: number; month: number; day?: number; energy_wh: number }[] | null;
}

// --- Mapping ---

/** `device_id` or `device_id:child_id`, URL-safe key shared with power data. */
function deviceKey(deviceId: string, childId?: string | null): string {
  return childId ? `${deviceId}:${childId}` : deviceId;
}

function splitKey(id: string): { deviceId: string; childId?: string } {
  const [deviceId, childId] = id.split(':', 2);
  return childId ? { deviceId, childId } : { deviceId };
}

function kindOf(deviceType: string, childId: string | null): DeviceKind {
  if (childId) return 'strip-outlet';
  const type = deviceType.toUpperCase();
  if (type.endsWith('CHILD')) return 'strip-outlet';
  if (
    type.startsWith('HS300') ||
    type.startsWith('KP303') ||
    type.startsWith('KP400') ||
    type.startsWith('EP40')
  )
    return 'strip';
  if (type.startsWith('KL')) return 'bulb';
  if (type.startsWith('HS200') || type.startsWith('KP200')) return 'switch';
  if (type.startsWith('HS') || type.startsWith('KP') || type.startsWith('EP')) return 'plug';
  return 'unknown';
}

function toDevice(summary: TplinkDeviceSummary): Device {
  const kind = kindOf(summary.device_type, summary.child_id);
  return {
    id: deviceKey(summary.device_id, summary.child_id),
    vendor: 'tplink',
    name: summary.alias,
    model: summary.model,
    kind,
    isOnline: summary.is_online,
    isOn: summary.is_on,
    capabilities: {
      // A strip parent has no single on/off; unknown models are monitor-only
      switchable: kind !== 'strip' && kind !== 'unknown',
      emeter: summary.has_emeter,
    },
    rssi: summary.rssi,
  };
}

function toEnergy(usage: TplinkEnergyUsage): DeviceEnergy {
  return {
    deviceId: deviceKey(usage.device_id, usage.child_id),
    name: usage.name,
    samples: (usage.data ?? []).map((sample) => ({
      // `day` is absent in monthly data; use the 1st as the bucket date
      date: new Date(sample.year, sample.month - 1, sample.day ?? 1),
      energyWh: sample.energy_wh,
    })),
  };
}

/**
 * The TP-Link implementation of DeviceProvider. It is selected at the
 * composition root (see src/api/provider.tsx / main.tsx), not bound here — so a
 * future home-ui adds providers without editing this leaf module.
 */
export const tplinkProvider: DeviceProvider = {
  vendor: 'tplink',

  async listDevices(): Promise<Device[]> {
    const response = await http.get<{ data: TplinkDeviceSummary[] }>('/devices');
    return response.data.map(toDevice);
  },

  async getDevice(id: string): Promise<DeviceDetail> {
    const { deviceId, childId } = splitKey(id);
    const response = await http.get<{ data: TplinkDeviceDetail }>(
      `/devices/${encodeURIComponent(deviceId)}`,
      { child_id: childId },
    );
    return {
      ...toDevice(response.data),
      raw: response.data.sys_info,
      network: response.data.net_info,
    };
  },

  async setPower(id: string, action: PowerAction): Promise<PowerResult> {
    const { deviceId, childId } = splitKey(id);
    const response = await http.post<{
      device_id: string;
      child_id: string | null;
      is_on: boolean | null;
    }>(`/devices/${encodeURIComponent(deviceId)}/power`, {
      params: { child_id: childId },
      json: { action },
    });
    return { deviceId: id, isOn: response.is_on };
  },

  async getCurrentPower(nameFilter?: string): Promise<PowerReading[]> {
    const response = await http.get<{ data: TplinkPowerCurrent[] }>('/power/devices/current', {
      named: nameFilter,
    });
    return response.data.map((reading) => {
      const watts = reading.data === null ? null : reading.data.power_mw / 1000;
      return {
        deviceId: deviceKey(reading.device_id, reading.child_id),
        name: reading.name,
        watts: watts !== null && Number.isFinite(watts) ? watts : null,
      };
    });
  },

  async getDailyEnergy(nameFilter?: string): Promise<DeviceEnergy[]> {
    const response = await http.get<{ data: TplinkEnergyUsage[] }>('/power/devices/day', {
      named: nameFilter,
    });
    return response.data.map(toEnergy);
  },

  async getMonthlyEnergy(nameFilter?: string): Promise<DeviceEnergy[]> {
    const response = await http.get<{ data: TplinkEnergyUsage[] }>('/power/devices/month', {
      named: nameFilter,
    });
    return response.data.map(toEnergy);
  },
};
