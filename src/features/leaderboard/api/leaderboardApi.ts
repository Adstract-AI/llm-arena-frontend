import type { LeaderboardModel } from '../types'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getLeaderboard(): Promise<LeaderboardModel[]> {
  await wait(400)

  // Placeholder until backend endpoint is connected.
  return [
    { id: 'm1', rank: 1, name: 'Astra Prime', score: 1912, winRate: 64.2, votes: 1432 },
    { id: 'm2', rank: 2, name: 'Nimbus Ultra', score: 1874, winRate: 61.9, votes: 1377 },
    { id: 'm3', rank: 3, name: 'Nova Reasoner', score: 1826, winRate: 59.3, votes: 1201 },
    { id: 'm4', rank: 4, name: 'Vector 3.2', score: 1789, winRate: 56.7, votes: 1134 },
    { id: 'm5', rank: 5, name: 'Lyric Pro', score: 1748, winRate: 54.8, votes: 987 },
  ]
}
