import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from '../features/home/pages/HomePage'
import { ArenaPage } from '../features/arena/pages/ArenaPage'
import { ChatPage } from '../features/chat/pages/ChatPage'
import { AboutPage } from '../features/about/pages/AboutPage'
import { LeaderboardPage } from '../features/leaderboard/pages/LeaderboardPage'
import { ModelDetailsPage } from '../features/leaderboard/pages/ModelDetailsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'arena', element: <ArenaPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'models/:modelName', element: <ModelDetailsPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
])
