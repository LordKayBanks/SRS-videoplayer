import './index.scss'

import App from './App'
import React from 'react'
import { render } from 'react-dom'

// ===============================
// import './player/context'
// import './player/boost'
// import './storage.js'
// import './keyboard.js'

// import './utility/seedData.js'
import { keepTrackOfReviews } from './utility/startup'

keepTrackOfReviews()

// ===============================

const container = document.getElementById('root')

render(<App />, container)
