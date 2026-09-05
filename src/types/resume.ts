export interface ResumeCert {
  name: string
  org?: string
  year?: string
}

export interface Resume {
  name: string
  skills: string[]
  certs: ResumeCert[]
  highlights: Record<string, string[]> // mountainId -> bullets
}