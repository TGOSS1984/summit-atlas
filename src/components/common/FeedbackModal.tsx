import { useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useClimbs } from '../../context/ClimbsContext'
import { FEEDBACK_TYPES, buildFeedbackIssueUrl, type FeedbackType } from '../../utils/feedback'
import { Modal } from './Modal'
import styles from './FeedbackModal.module.css'

interface FeedbackModalProps {
  onClose: () => void
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { climbedIds } = useClimbs()
  const location = useLocation()
  const [type, setType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    const url = buildFeedbackIssueUrl(type, trimmed, {
      view: location.pathname,
      peaksLogged: climbedIds.size,
    })

    // a synthetic link click, not window.open() - passing a feature string
    // like "noopener" to window.open makes browsers treat it as a popup,
    // which blockers silently swallow. a clicked anchor is plain link
    // navigation and always opens the tab, same reasoning peakbook's own
    // submitFeedback uses
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()

    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Feedback</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <span className={styles.label}>What kind of feedback?</span>
          <div className={styles.typeRow} role="group" aria-label="Feedback type">
            {(Object.keys(FEEDBACK_TYPES) as FeedbackType[]).map((key) => (
              <button
                key={key}
                type="button"
                className={key === type ? `${styles.typeBtn} ${styles.typeBtnActive}` : styles.typeBtn}
                onClick={() => setType(key)}
              >
                {FEEDBACK_TYPES[key].chip}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>What's up?</span>
          <textarea
            className={styles.textarea}
            rows={5}
            maxLength={2000}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="The more detail the better. What happened, or what would you love to see?"
          />
        </label>

        <button type="submit" className={styles.submitButton}>
          Continue on GitHub →
        </button>
        <p className={styles.hint}>
          This opens GitHub with your report pre-filled, where you press "Submit new issue" to file
          it (needs a free GitHub account).
        </p>
      </form>
    </Modal>
  )
}