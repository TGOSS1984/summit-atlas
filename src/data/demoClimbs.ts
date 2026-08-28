import type { ClimbsState } from '../utils/climbs'

// sample data for the "load demo data" button - originally just enough to
// not look completely empty (commit 13), expanded here so dashboard v2's
// charts/bands/timeline have something worth looking at instead of one bar
// per year and a single altitude band with a count in it. spans 2016-2025,
// covers all five altitude bands and five of the seven continents, and
// Ben Nevis gets climbed twice to show a repeat ascent in the timeline
export const DEMO_CLIMBS: ClimbsState = {
  'ben-nevis': [{ date: '2016-05-01' }, { date: '2018-06-14' }],
  snowdon: [{ date: '2016-09-03' }],
  fuji: [{ date: '2017-07-22', note: 'Overnight hut stop to catch sunrise from the summit' }],
  toubkal: [{ date: '2017-10-11' }],
  kilimanjaro: [{ date: '2019-08-02', note: 'Machame route, 6 days' }],
  'mont-blanc': [{ date: '2021-07-19' }],
  rainier: [{ date: '2022-07-02' }],
  matterhorn: [{ date: '2022-08-05' }],
  denali: [{ date: '2023-06-18', note: 'West Buttress, 17 days on the mountain' }],
  elbrus: [{ date: '2023-07-11', note: 'South route' }],
  aconcagua: [{ date: '2024-01-14', note: 'Normal route via Plaza de Mulas' }],
  eiger: [{ date: '2024-08-22' }],
  'cho-oyu': [{ date: '2025-05-09', note: 'First 8,000er - six weeks including acclimatisation rotations' }],
}