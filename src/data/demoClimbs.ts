import type { ClimbsState } from '../utils/climbs'

// realistic-looking sample data for the "load demo data" button - dates are
// made up but plausible, just here so the dashboard/map/lists don't look
// empty when someone's kicking the tyres before logging anything real
export const DEMO_CLIMBS: ClimbsState = {
  'ben-nevis': [{ date: '2018-06-14' }],
  kilimanjaro: [{ date: '2019-08-02', note: 'Machame route, 6 days' }],
  'mont-blanc': [{ date: '2021-07-19' }],
  matterhorn: [{ date: '2022-08-05' }],
  elbrus: [{ date: '2023-07-11', note: 'South route' }],
  eiger: [{ date: '2024-08-22' }],
}