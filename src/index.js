import './index.scss'

import App from './App'
import React from 'react'
import { render } from 'react-dom'

// ===============================
// import './player/context'
// import './player/boost'
// import './storage.js'
// import './keyboard.js'

import setupInitialSeed from './utility/seedData.js'
import { keepTrackOfReviews } from './utility/startup'

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    setupInitialSeed({ isOnline: true })
} else {
    setupInitialSeed({ isOnline: false })
}

keepTrackOfReviews()

// ===============================

const container = document.getElementById('root')

render(<App />, container)
