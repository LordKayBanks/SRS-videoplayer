import './index.scss'

import App from './App'
import React from 'react'
import { render } from 'react-dom'

// ===============================
// import './player/context'
// import './player/boost'
// import './storage.js'
// import './keyboard.js'

// import drag from './player/drag'
// import playlist from './components/playlist'
import { keepTrackOfReviews } from './utility/startup'

keepTrackOfReviews()
// drag.onDrag(files => playlist.loadVideo(files))

// import '../utility/seedData.js';
// ===============================

const container = document.getElementById('root')

render(<App />, container)
