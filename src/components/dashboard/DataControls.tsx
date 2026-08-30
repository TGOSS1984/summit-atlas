import { useRef, useState, type ChangeEvent } from 'react'
import { useClimbs } from '../../context/ClimbsContext'
import { exportClimbsFile, parseImportedFile } from '../../store/climbsStore'
import styles from './DataControls.module.css'

export function DataControls() {
  const { climbs, climbedIds, isDemoData, replaceAll, loadDemoData } = useClimbs()
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
      e.target.value = ''
    }
  }

    function handleLoadDemoData() {
    // only ask if there's real data to lose - reloading demo data over
    // demo data (i.e. "give me a different random sample") needs no warning
        const hasRealData = climbedIds.size > 0 && !isDemoData
        if (hasRealData && !window.confirm('This replaces your current climb data with sample data. Continue?')) {
        return
        }
        loadDemoData()
    }

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.button} onClick={() => exportClimbsFile(climbs)}>
        Export data
      </button>
      <button type="button" className={styles.button} onClick={() => fileInputRef.current?.click()}>
        Import data
      </button>
      <button type="button" className={styles.button} onClick={handleLoadDemoData}>
        Load demo data
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