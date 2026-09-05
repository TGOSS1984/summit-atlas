import { useState, type SyntheticEvent } from 'react'
import { flushSync } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import { useClimbs } from '../../context/ClimbsContext'
import { useResume } from '../../context/ResumeContext'
import { useUnit } from '../../context/UnitContext'
import { useAllMountains } from '../../hooks/useAllMountains'
import { getAllAscents } from '../../utils/dashboardStats'
import { foldRepeatAscents, resumeBullets } from '../../utils/resume'
import { formatElevation } from '../../utils/units'
import { triggerResumePrint } from '../../utils/printResume'
import type { ResumeCert } from '../../types/resume'
import { Modal } from '../common/Modal'
import styles from './ResumeBuilderModal.module.css'

interface ResumeBuilderModalProps {
  onClose: () => void
}

function linesOf(value: string): string[] {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function ResumeBuilderModal({ onClose }: ResumeBuilderModalProps) {
  const { user } = useAuth()
  const { climbs } = useClimbs()
  const { resume, replaceAll } = useResume()
  const { unit } = useUnit()
  const mountains = useAllMountains()

  // most-recently-climbed peak first, matching the order the résumé prints
  // in - an elevation sort here made the highlight rows feel shuffled
  // against the printed output
  const foldedPeaks = foldRepeatAscents(getAllAscents(mountains, climbs))

  const [name, setName] = useState(resume.name || user?.displayName || '')
  const [skillsText, setSkillsText] = useState(resume.skills.join('\n'))
  const [certs, setCerts] = useState<ResumeCert[]>(resume.certs.length ? resume.certs : [])
  const [highlightsText, setHighlightsText] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const entry of foldedPeaks) {
      initial[entry.mountain.id] = resumeBullets(resume.highlights, entry.mountain.id, entry.note).join('\n')
    }
    return initial
  })

  function updateCert(index: number, field: keyof ResumeCert, value: string) {
    setCerts((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  function addCert() {
    setCerts((prev) => [...prev, { name: '', org: '', year: '' }])
  }

  function removeCert(index: number) {
    setCerts((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: SyntheticEvent, exportAfter: boolean) {
    e.preventDefault()

    const cleanedCerts = certs
      .map((c) => ({ name: c.name.trim(), org: (c.org ?? '').trim(), year: (c.year ?? '').trim() }))
      .filter((c) => c.name.length > 0)

    // start from what's already saved so highlights for peaks not shown in
    // this form (a climb since deleted, say) survive rather than vanish
    const highlights = { ...resume.highlights }
    for (const entry of foldedPeaks) {
      const bullets = linesOf(highlightsText[entry.mountain.id] ?? '')
      if (bullets.length) highlights[entry.mountain.id] = bullets
      else delete highlights[entry.mountain.id]
    }

    const nextResume = {
      name: name.trim(),
      skills: linesOf(skillsText),
      certs: cleanedCerts,
      highlights,
    }

    // synchronous so PrintResume (reading the same context) has already
    // re-rendered with the new résumé before window.print() fires
    flushSync(() => replaceAll(nextResume))
    onClose()
    if (exportAfter) triggerResumePrint(nextResume.name || user?.displayName || 'A climber')
  }

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Climbing résumé</h2>
      <p className={styles.subtitle}>Skills, courses, and expedition highlights, exported as a clean PDF.</p>

      <form className={styles.form} onSubmit={(e) => handleSubmit(e, false)}>
        <label className={styles.field}>
          <span className={styles.label}>Name on the résumé</span>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Skills (one per line)</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder={'Glacier travel & crevasse rescue\nAD+ alpine routes\nExpedition planning'}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Certifications &amp; courses</span>
          <div className={styles.certList}>
            {certs.map((cert, i) => (
              <div className={styles.certRow} key={i}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="AIARE 1 — Avalanche Rescue"
                  value={cert.name}
                  onChange={(e) => updateCert(i, 'name', e.target.value)}
                  maxLength={80}
                  aria-label="Course or certification"
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="AIARE"
                  value={cert.org ?? ''}
                  onChange={(e) => updateCert(i, 'org', e.target.value)}
                  maxLength={80}
                  aria-label="Organization"
                />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="2024"
                  value={cert.year ?? ''}
                  onChange={(e) => updateCert(i, 'year', e.target.value)}
                  maxLength={20}
                  aria-label="Year"
                />
                <button
                  type="button"
                  className={styles.certRemove}
                  onClick={() => removeCert(i)}
                  aria-label="Remove this entry"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addButton} onClick={addCert}>
            + Add a course or cert
          </button>
        </div>

        {foldedPeaks.length > 0 && (
          <div className={styles.field}>
            <span className={styles.label}>Expedition highlights (one bullet per line)</span>
            <div className={styles.highlightList}>
              {foldedPeaks.map((entry) => (
                <div className={styles.highlightRow} key={entry.mountain.id}>
                  <div className={styles.highlightPeakLine}>
                    <span>{entry.mountain.flag}</span>
                    <strong>{entry.mountain.name}</strong>
                    {entry.dates.length > 1 && (
                      <span className={styles.ascentTimes}>×{entry.dates.length}</span>
                    )}
                    <span className={styles.highlightElev}>{formatElevation(entry.mountain.elevation, unit)}</span>
                    <span className={styles.highlightDates}>{entry.dates.map(formatDate).join(' · ')}</span>
                  </div>
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    maxLength={1000}
                    value={highlightsText[entry.mountain.id] ?? ''}
                    onChange={(e) =>
                      setHighlightsText((prev) => ({ ...prev, [entry.mountain.id]: e.target.value }))
                    }
                    placeholder="Led the rope team on summit day…"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.secondaryButton}>
            Save
          </button>
          <button type="button" className={styles.primaryButton} onClick={(e) => handleSubmit(e, true)}>
            Save &amp; export PDF
          </button>
        </div>
      </form>
    </Modal>
  )
}