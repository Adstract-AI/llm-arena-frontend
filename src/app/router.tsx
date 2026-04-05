import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from '../features/home/pages/HomePage'
import { ArenaPage } from '../features/arena/pages/ArenaPage'
import { ChatPage } from '../features/chat/pages/ChatPage'
import { AboutPage } from '../features/about/pages/AboutPage'
import { LeaderboardPage } from '../features/leaderboard/pages/LeaderboardPage'
import { ModelDetailsPage } from '../features/leaderboard/pages/ModelDetailsPage'
import { ExperimentalArenaPage } from '../features/experimentalArena/pages/ExperimentalArenaPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { OAuthCallbackPage } from '../features/auth/pages/OAuthCallbackPage'
import { PrivacyPolicyPage } from '../features/legal/pages/PrivacyPolicyPage'
import { TermsOfServicePage } from '../features/legal/pages/TermsOfServicePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'arena', element: <ArenaPage /> },
      { path: 'experimental', element: <ExperimentalArenaPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'models/:modelName', element: <ModelDetailsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsOfServicePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'auth/github/callback', element: <OAuthCallbackPage provider="github" /> },
      { path: 'auth/google/callback', element: <OAuthCallbackPage provider="google" /> },
    ],
  },
])
