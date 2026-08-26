import { useRef, useState, type ChangeEvent } from 'react'
import { useClimbs } from '../../context/ClimbsContext'
import { exportClimbsFile, parseImportedFile } from '../../store/climbsStore'
import styles from './DataControls.module.css'

export function DataControls() {
  const { climbs, replaceAll } = useClimbs()
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await parseImportedFile(file)
      replaceAll(imported)
      setMessage('Import successful.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      // reset so picking the same filename twice in a row still fires onChange
      e.target.value = ''
    }
  }

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.button} onClick={() => exportClimbsFile(climbs)}>
        Export data
      </button>
      <button type="button" className={styles.button} onClick={() => fileInputRef.current?.click()}>
        Import data
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        className={styles.hiddenInput}
      />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}