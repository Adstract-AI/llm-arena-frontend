import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from '../features/home/pages/HomePage'
import { ArenaPage } from '../features/arena/pages/ArenaPage'
import { AboutPage } from '../features/about/pages/AboutPage'
import { LeaderboardPage } from '../features/leaderboard/pages/LeaderboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'chatvote', element: <ArenaPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
])
