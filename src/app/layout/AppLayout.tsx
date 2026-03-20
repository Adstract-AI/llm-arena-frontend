import { Link, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/arena', label: 'Arena' },
  { to: '/settings', label: 'Settings' },
]

export function AppLayout() {
  return (
    <div>
      <header>
        <h1>LLM Arena</h1>
        <nav aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} style={{ marginRight: 12 }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
