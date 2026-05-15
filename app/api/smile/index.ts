import { ToothEvent, ToothPrediction, TeethExchangeStats } from '@/types/teeth';
function makeId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random()*100000).toString(36)}`;
}

// Mock data stores
const mockEvents: ToothEvent[] = [
  {
    id: makeId(),
    occurrenceDate: new Date().toISOString(),
    dentition: 'permanent',
    arch: 'upper',
    side: 'left',
    toothType: 'central_incisor',
    eventType: 'eruption',
    note: 'Teste mock',
  },
];

const mockPredictions: ToothPrediction[] = [
  {
    id: makeId(),
    toothType: 'lateral_incisor',
    expectedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    title: 'Incisivo Lateral Superior',
  },
];

export async function getToothEvents(_kidId: string) {
  // return mock events after a short delay
  await new Promise((r) => setTimeout(r, 150));
  return mockEvents;
}

export async function getToothPredictions(_kidId: string) {
  await new Promise((r) => setTimeout(r, 150));
  return mockPredictions;
}

export async function registerToothEvent(kidId: string, payload: Omit<ToothEvent, 'id'>) {
  const ev: ToothEvent = { ...payload, id: makeId() };
  mockEvents.unshift(ev);
  await new Promise((r) => setTimeout(r, 100));
  return ev;
}

export async function getTeethExchangeStats(_kidId: string): Promise<TeethExchangeStats> {
  await new Promise((r) => setTimeout(r, 50));
  return { totalMilkTeeth: 20, exchanged: 4 };
}
