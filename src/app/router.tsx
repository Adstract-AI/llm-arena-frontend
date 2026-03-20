import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from '../features/home/pages/HomePage'
import { ArenaPage } from '../features/arena/pages/ArenaPage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'arena', element: <ArenaPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
