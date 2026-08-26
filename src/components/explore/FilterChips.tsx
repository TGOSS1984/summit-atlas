import styles from './FilterChips.module.css'

interface ChipOption {
  id: string | null
  label: string
}

interface FilterChipsProps {
  options: ChipOption[]
  activeId: string | null
  onSelect: (id: string | null) => void
}

export function FilterChips({ options, activeId, onSelect }: FilterChipsProps) {
  return (
    <div className={styles.row}>
      {options.map((option) => (
        <button
          key={option.id ?? 'all'}
          type="button"
          className={activeId === option.id ? styles.chipActive : styles.chip}
          onClick={() => onSelect(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}