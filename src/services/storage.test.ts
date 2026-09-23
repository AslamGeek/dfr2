import { describe, it, expect, beforeEach } from 'vitest';
import { reportStorage } from './storage';
import type { DailyRecord } from '../types';

describe('Local Storage & Monthly Records Order', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }

    // Mock localStorage for Node test runner
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      },
      key: (i: number) => Object.keys(store)[i] || null,
      length: Object.keys(store).length,
    } as Storage;
  });

  it('sorts daily records descending (most recent first, oldest at bottom)', async () => {
    const records: DailyRecord[] = [
      {
        dateKey: '2026-03-05',
        workPlace: 'Proddatur',
        doctors: 8,
        chemists: 6,
        newConversions: 2,
        pob: 5000,
      },
      {
        dateKey: '2026-03-18',
        workPlace: 'Jammalamadugu',
        doctors: 12,
        chemists: 10,
        newConversions: 3,
        pob: 8000,
      },
      {
        dateKey: '2026-03-01',
        workPlace: 'Kamalapuram / Yerraguntla',
        doctors: 7,
        chemists: 5,
        newConversions: 1,
        pob: 4000,
      },
      {
        dateKey: '2026-03-12',
        workPlace: 'Mydukuru /GV Satram',
        doctors: 9,
        chemists: 7,
        newConversions: 2,
        pob: 6000,
      },
    ];

    for (const rec of records) {
      await reportStorage.saveRecord(rec);
    }

    const overview = await reportStorage.getMonthlyRecords('2026-03');
    expect(overview.records.length).toBe(4);

    // Latest (most recent) at the top:
    expect(overview.records[0].dateKey).toBe('2026-03-18');
    expect(overview.records[1].dateKey).toBe('2026-03-12');
    expect(overview.records[2].dateKey).toBe('2026-03-05');
    // Oldest at the bottom:
    expect(overview.records[3].dateKey).toBe('2026-03-01');
  });

  it('guarantees latest date at the top and oldest at the bottom even when added out of order', async () => {
    const dates = [
      '2026-04-02',
      '2026-04-28',
      '2026-04-14',
      '2026-04-30',
      '2026-04-01',
      '2026-04-20',
    ];

    for (const d of dates) {
      await reportStorage.saveRecord({
        dateKey: d,
        workPlace: 'Proddatur',
        doctors: 5,
        chemists: 5,
        newConversions: 1,
        pob: 1000,
      });
    }

    const overview = await reportStorage.getMonthlyRecords('2026-04');
    expect(overview.records.map((r) => r.dateKey)).toEqual([
      '2026-04-30', // Latest at top
      '2026-04-28',
      '2026-04-20',
      '2026-04-14',
      '2026-04-02',
      '2026-04-01', // Oldest at bottom
    ]);
  });

  it('migrates from legacy sheet keys and purges them completely from device storage', async () => {
    // Seed old legacy key
    const oldRecord: DailyRecord = {
      dateKey: '2026-05-10',
      workPlace: 'Proddatur',
      doctors: 9,
      chemists: 7,
      newConversions: 2,
      pob: 11000,
    };
    store['dfwr_sheet_records'] = JSON.stringify({
      '2026-05-10': oldRecord,
    });

    const record = await reportStorage.getRecord('2026-05-10');
    expect(record.doctors).toBe(9);
    expect(record.workPlace).toBe('Proddatur');

    // Legacy key must be purged
    expect(store['dfwr_sheet_records']).toBeUndefined();
    // Pure local key must now hold data
    expect(store['dfwr_local_records']).toBeDefined();
  });

  it('exports and restores device-specific backup correctly', async () => {
    await reportStorage.saveRecord({
      dateKey: '2026-06-01',
      workPlace: 'Proddatur',
      doctors: 10,
      chemists: 8,
      newConversions: 4,
      pob: 12000,
    });

    const exported = reportStorage.exportDeviceBackup();
    expect(exported).toContain('device-local');
    expect(exported).toContain('2026-06-01');

    // Clear store and restore
    delete store['dfwr_local_records'];
    const success = reportStorage.restoreDeviceBackup(exported);
    expect(success).toBe(true);

    const record = await reportStorage.getRecord('2026-06-01');
    expect(record.doctors).toBe(10);
    expect(record.pob).toBe(12000);
  });
});
