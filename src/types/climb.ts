export interface ClimbRecord {
  date: string // ISO yyyy-mm-dd, matches <input type="date">
  note?: string
  photo?: string // data URL - see utils/photoUpload.ts for the resize/compress step before this ever gets set
}