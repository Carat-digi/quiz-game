import { useState, useEffect, useCallback } from 'react'
import { getQuizLeaderboard } from '../api/result'
import logger from '../utils/logger'
import '../styles/leaderboard.css'

const Leaderboard = ({ quizId }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  const loadLeaderboard = useCallback(async () => {
    try {
      const { leaderboard } = await getQuizLeaderboard(quizId, 10)
      setLeaderboard(leaderboard)
    } catch (error) {
      logger.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  const getMedalEmoji = (rank) => {
    switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
    }
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return <div className="leaderboard-loading">📊 Loading leaderboard...</div>
  }

  if (!leaderboard || leaderboard.length === 0) {
    return <div className="leaderboard-empty">No scores yet. Be the first to complete this quiz!</div>
  }

  return (
    <div className="leaderboard">
      <h3>🏆 Top 10 Scores</h3>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => {
            const rank = index + 1
            const medal = getMedalEmoji(rank)
            return (
              <tr key={index}>
                <td>{medal} {rank}</td>
                <td>{entry.username}</td>
                <td>{entry.percentage}%</td>
                <td>{formatTime(entry.timeSpent)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Leaderboard