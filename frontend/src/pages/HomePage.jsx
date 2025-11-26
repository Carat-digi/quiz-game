import { useNavigate } from 'react-router-dom'
import '../styles/homePage.css'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div>
      <div className='home-page'>
        <div className='home-title'>
          <h1 className='title1'>Welcome to the</h1>
          <h1 className='title2'>QuizGame</h1>
        </div>
        <div className='home-slogan'>
          Challenge your mind, enjoy the game
        </div>
        <div className='choice-action'>
          <button className='action-login' onClick={() => navigate('/login')}>Sign in</button>
          <button className='action-create' onClick={() => navigate('/register')}>Create account</button>
        </div>
      </div>
    </div>
  )
}

export default HomePage