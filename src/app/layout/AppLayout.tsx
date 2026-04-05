import { useEffect, useRef, useState } from 'react'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { deleteCurrentUser } from '../../features/auth/api/authApi'
import { AuthProvider, useAuth } from '../../features/auth/context/AuthContext'

const navItems = [
  { to: '/arena', label: 'Arena' },
  { to: '/experimental', label: 'Experimental' },
  { to: '/chat', label: 'Chat' },
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

function AppLayoutInner() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const {
    isAuthenticated,
    isInitializing,
    logout,
    openLoginPage,
    loadCurrentUser,
    user,
  } = useAuth()
  const logoSrc =
    theme === 'dark' ? '/mak_final_black_transparent.png' : '/mak_final_white_transparent.png'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handlePointerDown)
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isUserMenuOpen])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDeleteConfirmOpen(false)
        setDeleteAccountError(null)
      }
    }

    if (isDeleteConfirmOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isDeleteConfirmOpen])

  useEffect(() => {
    if (isUserMenuOpen) {
      void loadCurrentUser()
    }
    // loadCurrentUser comes from context and does not need to retrigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserMenuOpen])

  async function handleDeleteAccount() {
    if (isDeletingAccount) {
      return
    }

    setDeleteAccountError(null)
    setIsDeletingAccount(true)

    try {
      await deleteCurrentUser()
      setIsDeleteConfirmOpen(false)
      setIsUserMenuOpen(false)
      logout(false)
      navigate('/')
    } catch (error) {
      setDeleteAccountError(
        error instanceof Error ? error.message : 'Could not delete account.',
      )
    } finally {
      setIsDeletingAccount(false)
    }
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

            {!isInitializing ? (
              isAuthenticated && user ? (
                <div className="user-menu" ref={menuRef}>
                  <button
                    type="button"
                    className={
                      isUserMenuOpen
                        ? 'user-menu__trigger user-menu__trigger--open'
                        : 'user-menu__trigger'
                    }
                    onClick={() => setIsUserMenuOpen((current) => !current)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Open user menu"
                  >
                    <AccountCircleRoundedIcon
                      aria-hidden="true"
                      className="user-menu__trigger-icon"
                    />
                  </button>

                  {isUserMenuOpen ? (
                    <div className="user-menu__dropdown" role="menu">
                      <div className="user-menu__identity">
                        <strong className="user-menu__name">
                          {user.username || 'MakArena user'}
                        </strong>
                        <span className="user-menu__email">{user.email}</span>
                      </div>
                      <div className="user-menu__divider" aria-hidden="true" />
                      <button
                        type="button"
                        className="user-menu__logout"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          logout(false)
                        }}
                      >
                        Logout
                      </button>
                      <button
                        type="button"
                        className="user-menu__delete"
                        onClick={() => {
                          setDeleteAccountError(null)
                          setIsDeleteConfirmOpen(true)
                        }}
                      >
                        Delete account
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost topbar__login"
                  onClick={() => openLoginPage()}
                >
                  Login
                </button>
              )
            ) : null}

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

      {isDeleteConfirmOpen ? (
        <div
          className="confirm-dialog-backdrop"
          onClick={() => {
            if (!isDeletingAccount) {
              setIsDeleteConfirmOpen(false)
              setDeleteAccountError(null)
            }
          }}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="confirm-dialog__eyebrow">Delete account</p>
            <h2 id="delete-account-title">This action cannot be undone.</h2>
            <p id="delete-account-description" className="confirm-dialog__copy">
              Every sensitive piece of information connected to your account will be
              deleted. This step is irreversible.
            </p>
            {deleteAccountError ? (
              <p className="confirm-dialog__error">{deleteAccountError}</p>
            ) : null}
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setDeleteAccountError(null)
                }}
                disabled={isDeletingAccount}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-dialog__danger"
                onClick={() => void handleDeleteAccount()}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export function AppLayout() {
  return (
    <AuthProvider>
      <AppLayoutInner />
    </AuthProvider>
  )
}
