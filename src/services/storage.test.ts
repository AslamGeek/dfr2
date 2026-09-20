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
});
