export interface ClimbRecord {
  date: string // ISO yyyy-mm-dd, matches <input type="date">
  note?: string
  photo?: string // data URL - see utils/photoUpload.ts for the resize/compress step before this ever gets set
  grade?: string // free text on purpose - no single grading system (French Alpine, YDS, UIAA, Scottish winter...) fits every entry an app spanning day-hikes to technical alpine climbs needs to record
}