import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useUnit } from '../../context/UnitContext'
import { SummitPinIcon } from '../common/SummitPinIcon'
import { FeedbackModal } from '../common/FeedbackModal'
import { PeakPicker } from '../common/PeakPicker'
import { CommandPalette } from '../common/CommandPalette'
import { MountainDetailModal } from '../mountain/MountainDetailModal'
import { AddPeakModal } from '../mountain/AddPeakModal'
import { COLLECTIONS_BY_MOUNTAIN } from '../../data/collectionsByMountain'
import type { Mountain } from '../../types/mountain'
import { AccountArea } from './AccountArea'
import { NAV_ITEMS } from './navItems'
import { CollectionCompleteWatcher } from './CollectionCompleteWatcher'
import styles from './Layout.module.css'

export function Layout() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null)
  const [showAddPeak, setShowAddPeak] = useState(false)

  // Cmd+K on Mac, Ctrl+K everywhere else - global rather than scoped to one
  // page, same reasoning as the picker's state living here
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={styles.app}>
      <Sidebar onLogClimb={() => setPickerOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />
      <MobileTopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <TabBar />
      <CollectionCompleteWatcher />

      {/* fixed bottom-right rather than peakbook's bottom-left - bottom-left
          on our layout would sit under the sidebar on desktop and get lost
          near the tab bar's first icon on mobile */}
      <button
        type="button"
        className={styles.feedbackButton}
        onClick={() => setFeedbackOpen(true)}
        title="Send feedback"
        aria-label="Send feedback"
      >
        <FeedbackIcon />
      </button>
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}

      {/* picker -> peak detail (or -> add-your-own-peak) is one chain, all
          state lives here rather than in whichever page happens to be
          mounted, since this button needs to work from any route */}
      {pickerOpen && (
        <PeakPicker
          onClose={() => setPickerOpen(false)}
          onSelectPeak={(mountain) => {
            setPickerOpen(false)
            setSelectedMountain(mountain)
          }}
          onAddOwnPeak={() => {
            setPickerOpen(false)
            setShowAddPeak(true)
          }}
        />
      )}
      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onSelectPeak={(mountain) => {
            setPaletteOpen(false)
            setSelectedMountain(mountain)
          }}
        />
      )}
      {selectedMountain && (
        <MountainDetailModal
          mountain={selectedMountain}
          collections={COLLECTIONS_BY_MOUNTAIN.get(selectedMountain.id) ?? []}
          onClose={() => setSelectedMountain(null)}
        />
      )}
      {showAddPeak && <AddPeakModal onClose={() => setShowAddPeak(false)} />}
    </div>
  )
}

function Sidebar({ onLogClimb, onOpenPalette }: { onLogClimb: () => void; onOpenPalette: () => void }) {
  const { theme, setTheme } = useTheme()
  const { unit, setUnit } = useUnit()

  return (
    <nav className={styles.sidebar}>
      <div className={styles.brand}>
        <SummitPinIcon className={styles.brandMark} />
        <span>Summit Atlas</span>
      </div>

      <button type="button" className={styles.searchButton} onClick={onOpenPalette}>
        <span>Search…</span>
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </button>

      <button type="button" className={styles.logClimbButton} onClick={onLogClimb}>
        + Log a climb
      </button>

      <div className={styles.navItems}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* account chip/sign-in button now sits above the toggle pill, both
          pinned to the bottom of the sidebar as one group - margin-top: auto
          moved onto this wrapper so adding the account area didn't leave it
          floating in the middle of the nav column */}
      <div className={styles.sidebarFooter}>
        <AccountArea />
        <div className={styles.toggleBar}>
          <button
            type="button"
            className={unit === 'm' ? `${styles.toggleBtn} ${styles.toggleBtnActive}` : styles.toggleBtn}
            onClick={() => setUnit('m')}
          >
            m
          </button>
          <button
            type="button"
            className={unit === 'ft' ? `${styles.toggleBtn} ${styles.toggleBtnActive}` : styles.toggleBtn}
            onClick={() => setUnit('ft')}
          >
            ft
          </button>
          <span className={styles.toggleDivider} aria-hidden="true" />
          <button
            type="button"
            className={theme === 'light' ? `${styles.toggleBtn} ${styles.toggleBtnActive}` : styles.toggleBtn}
            onClick={() => setTheme('light')}
            aria-label="Switch to light theme"
            title="Light theme"
          >
            <SunIcon />
          </button>
          <button
            type="button"
            className={theme === 'dark' ? `${styles.toggleBtn} ${styles.toggleBtnActive}` : styles.toggleBtn}
            onClick={() => setTheme('dark')}
            aria-label="Switch to dark theme"
            title="Dark theme"
          >
            <MoonIcon />
          </button>
        </div>
      </div>
    </nav>
  )
}

function MobileTopBar() {
  const { theme, setTheme } = useTheme()
  const { unit, setUnit } = useUnit()

  return (
    <div className={styles.mobileTopBar}>
      <span className={styles.mobileBrand}>
        <SummitPinIcon className={styles.mobileBrandMark} />
        Summit Atlas
      </span>

      <div className={styles.mobileToggleBar}>
        <button
          type="button"
          className={unit === 'm' ? `${styles.mobileToggleBtn} ${styles.mobileToggleBtnActive}` : styles.mobileToggleBtn}
          onClick={() => setUnit('m')}
        >
          m
        </button>
        <button
          type="button"
          className={unit === 'ft' ? `${styles.mobileToggleBtn} ${styles.mobileToggleBtnActive}` : styles.mobileToggleBtn}
          onClick={() => setUnit('ft')}
        >
          ft
        </button>
        <span className={styles.mobileToggleDivider} aria-hidden="true" />
        <button
          type="button"
          className={theme === 'light' ? `${styles.mobileToggleBtn} ${styles.mobileToggleBtnActive}` : styles.mobileToggleBtn}
          onClick={() => setTheme('light')}
          aria-label="Switch to light theme"
          title="Light theme"
        >
          <SunIcon />
        </button>
        <button
          type="button"
          className={theme === 'dark' ? `${styles.mobileToggleBtn} ${styles.mobileToggleBtnActive}` : styles.mobileToggleBtn}
          onClick={() => setTheme('dark')}
          aria-label="Switch to dark theme"
          title="Dark theme"
        >
          <MoonIcon />
        </button>
      </div>
    </div>
  )
}

// bottom tab bar, mobile-only counterpart to the sidebar's nav list - same
// NAV_ITEMS, same icons, just a different container
function TabBar() {
  return (
    <nav className={styles.tabbar}>
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? `${styles.tabItem} ${styles.tabItemActive}` : styles.tabItem
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z" />
    </svg>
  )
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}