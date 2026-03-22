import { useEffect, useState } from 'react'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/chatvote', label: 'Rate Models' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/about', label: 'About' },
]

type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'makarena-theme'

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

export function AppLayout() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const logoSrc =
    theme === 'dark' ? '/makarena_logo_black.png' : '/makarena_logo_green.png'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb--one" aria-hidden="true" />
      <div className="bg-orb bg-orb--two" aria-hidden="true" />
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="brand" aria-label="MakArena home">
            <span className="brand__logo-frame">
              <img src={logoSrc} alt="MakArena" className="brand__logo" />
            </span>
          </Link>

          <div className="topbar__actions">
            <nav aria-label="Main navigation" className="topnav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'topnav__link topnav__link--active' : 'topnav__link'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <LightModeRoundedIcon aria-hidden="true" className="theme-toggle__icon" />
              ) : (
                <DarkModeRoundedIcon aria-hidden="true" className="theme-toggle__icon" />
              )}
              <span className="sr-only">
                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
