import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import questionsData from './data/questions.json'

function App() {
  const [gameState, setGameState] = useState('START') // START, QUIZ, RESULT
  const [userName, setUserName] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [isShaking, setIsShaking] = useState(false)

  useEffect(() => {
    const savedLeaderboard = JSON.parse(localStorage.getItem('kumoxi_quiz_leaderboard') || '[]')
    setLeaderboard(savedLeaderboard)
  }, [])

  const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#C8102E', '#FFCD00', '#000000']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C8102E', '#FFCD00', '#000000']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const handleStart = (e) => {
    e.preventDefault()
    if (userName.trim()) {
      // Direct start with technical questions
      const filtered = questionsData.questions // All questions are now technical
      const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 7)
      setShuffledQuestions(shuffled)
      setGameState('QUIZ')
      setCurrentQuestionIndex(0)
      setScore(0)
      setSelectedOption(null)
      setIsCorrect(null)
    }
  }

  const handleOptionSelect = (option) => {
    if (selectedOption !== null) return

    setSelectedOption(option)
    const currentQuestion = shuffledQuestions[currentQuestionIndex]
    const correct = option === currentQuestion.answer
    setIsCorrect(correct)

    if (correct) {
      setScore(prev => prev + 1)
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFCD00', '#C8102E'] // Gold and Red burst for correct answer
      })
    } else {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }

    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedOption(null)
        setIsCorrect(null)
      } else {
        finishGame(correct ? score + 1 : score)
      }
    }, 1200) // Slightly longer delay to see the result
  }

  const finishGame = (finalScore) => {
    const newScore = {
      name: userName,
      score: finalScore,
      total: shuffledQuestions.length,
      category: 'Angola Tech',
      date: new Date().toLocaleDateString()
    }

    const updatedLeaderboard = [...leaderboard, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setLeaderboard(updatedLeaderboard)
    localStorage.setItem('kumoxi_quiz_leaderboard', JSON.stringify(updatedLeaderboard))
    setGameState('RESULT')

    // Celebration if score is good (> 50%)
    if (finalScore / shuffledQuestions.length > 0.5) {
      triggerConfetti()
    }
  }

  if (gameState === 'START') {
    return (
      <div className="glass-card">
        <h1 className="title">Kumoxi Quiz</h1>
        <p className="subtitle">Desafia o teu conhecimento sobre o Ecossistema Tecnológico de Angola!</p>
        <form onSubmit={handleStart} className="input-container">
          <input
            type="text"
            className="input-field"
            placeholder="Teu nome, Soba..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" className="btn btn-primary" style={{ marginTop: '30px' }}>
            Começar Desafio 🚀
          </button>
        </form>
      </div>
    )
  }

  if (gameState === 'RESULT') {
    const percentage = (score / shuffledQuestions.length) * 100
    let message = ''
    if (percentage === 100) message = 'Tu és o Boss do Ecossistema! 👑'
    else if (percentage >= 70) message = 'Ganda Mambo! Conheces bem a banda! 🔥'
    else if (percentage >= 50) message = 'Nada mal, estamos juntos! 👊'
    else message = 'Eish... tens de ir mais aos eventos! 😅'

    return (
      <div className="glass-card">
        <p className="subtitle" style={{ marginBottom: '10px' }}>Resultado Final</p>
        <h1 className="title">{userName}</h1>
        <div className="result-score">{score} / {shuffledQuestions.length}</div>
        <p className="question-text" style={{ color: 'var(--angola-yellow)' }}>{message}</p>

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>🏆 Hall of Fame</h3>
          <table className="leaderboard">
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx} style={entry.name === userName && entry.score === score ? { background: 'rgba(255, 205, 0, 0.1)' } : {}}>
                  <td>#{idx + 1} {entry.name}</td>
                  <td style={{ textAlign: 'right' }}>{entry.score}/{entry.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-primary" style={{ marginTop: '40px' }} onClick={() => setGameState('START')}>
          Jogar Novamente
        </button>
      </div>
    )
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex]

  return (
    <div className={`glass-card ${isShaking ? 'shake' : ''}`}>
      <div className="stats">
        <span>Questão {currentQuestionIndex + 1}/{shuffledQuestions.length}</span>
        <span style={{ color: 'var(--text-muted)' }}>Angola Tech</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
        ></div>
      </div>
      <h2 className="question-text">{currentQuestion.question}</h2>
      <div className="options-grid">
        {currentQuestion.options.map((option, index) => {
          let statusClass = ''
          if (selectedOption === option) {
            statusClass = isCorrect ? 'correct' : 'incorrect'
          } else if (selectedOption !== null && option === currentQuestion.answer) {
            statusClass = 'correct'
          }

          return (
            <button
              key={index}
              className={`btn option-btn ${statusClass}`}
              onClick={() => handleOptionSelect(option)}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default App
