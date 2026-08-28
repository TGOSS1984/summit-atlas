import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useUnit } from '../../context/UnitContext'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/explore', label: 'Explore', icon: ExploreIcon },
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/lists', label: 'Lists', icon: ListsIcon },
]

export function Layout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <MobileTopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

function Sidebar() {
  const { theme, setTheme } = useTheme()
  const { unit, setUnit } = useUnit()

  return (
    <nav className={styles.sidebar}>
      <div className={styles.brand}>
        <SummitPinIcon className={styles.brandMark} />
        <span>Summit Atlas</span>
      </div>

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

      {/* one pill, one settings row - used to be two plain buttons stacked
          with margin-top: auto, which read as two unrelated controls sitting
          oddly far apart. divider down the middle keeps unit and theme
          visually grouped as "two switches, one control" rather than merging
          them into a single four-state toggle, which would've been confusing */}
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
    </nav>
  )
}

// sidebar disappears below the mobile breakpoint (see Layout.module.css), so
// its brand mark and the two toggles need somewhere else to live - this bar
// is the mobile-only stand-in, hidden entirely on desktop. still the plain
// text-button version here - the segmented pill treatment above is desktop
// sidebar only for now, mobile hasn't been asked for it yet
function MobileTopBar() {
  const { theme, toggleTheme } = useTheme()
  const { unit, toggleUnit } = useUnit()

  return (
    <div className={styles.mobileTopBar}>
      <span className={styles.mobileBrand}>
        <SummitPinIcon className={styles.mobileBrandMark} />
        Summit Atlas
      </span>
      <div className={styles.mobileToggles}>
        <button className={styles.mobileToggle} onClick={toggleTheme}>
          {theme === 'dark' ? 'light' : 'dark'}
        </button>
        <button className={styles.mobileToggle} onClick={toggleUnit}>
          {unit === 'm' ? 'ft' : 'm'}
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

// the Summit Pin mark from the palette lab - a peak with a flagged pin at
// the apex, echoing the "log a climb" action. same shape as the favicon,
// just currentColor here instead of a fixed badge so it inherits whatever
// this container's already using for its accent
function SummitPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" className={className}>
      <path d="M2 18 L8 7 L14 18 Z" fill="currentColor" opacity="0.9" />
      <line x1="8" y1="7" x2="8" y2="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2.4 L13 4 L8 5.6 Z" fill="currentColor" />
    </svg>
  )
}

// plain sun/moon glyphs - just need to read clearly at 14px inside the pill
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

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

function ExploreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v15M15 6v15M4 6l5-3 6 3 5-3v15l-5 3-6-3-5 3V6z" />
    </svg>
  )
}

function ListsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8" />
    </svg>
  )
}