/* eslint-disable react-hooks/rules-of-hooks */
// import React, { useEffect, useSate } from 'react'

// export default function UseNotify({ msg = '', colormsg = '', period = 1200 }) {
//   const [message, setMessage] = useSate(null)

//   useEffect(() => {
//     setMessage({ msg, colormsg })

//     const id = setTimeout(() => {
//       setMessage(['', ''])
//     }, period)

//     return () => {
//       clearTimeout(id)
//     }
//   }, [message, colormsg, msg, period, setMessage])

//   return (
//     <div style={divStyle}>
//       <span>{message.msg}</span>
//       <span style={colorTextStyle}>{message.colormsg}</span>
//     </div>
//   )
// }

// const divStyle = `
//   position: fixed;
//   top: 30px;
//   left: 10px;
//   white-space: pre;
//   font-size:12px;
//   padding:6px;
//   background-color: rgba(0,0,0,0.6);
//   color:white;
// //   visibility: hidden;
//   border-radius: 10px;
//   border: 2px solid lime;
//   animation: blinking 5s infinite;
//   animation-timing-function: cubic-bezier(0.230, 1.000, 0.320, 1.000);
// }`

// const colorTextStyle = `
//   color: red;
//   font-weight:bold;`

import React, { Component } from 'react'
import { bool, node, number } from 'prop-types'

class FlashMessage extends Component {
  constructor(props) {
    super(props)

    this.state = { isVisible: true }

    this.hide = this.hide.bind(this)
    this.resumeTimer = this.resumeTimer.bind(this)
    this.pauseTimer = this.pauseTimer.bind(this)
  }

  componentDidMount() {
    const { duration } = this.props

    this.remaining = duration
    this.resumeTimer()
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  hide() {
    this.setState({ isVisible: false })
  }

  resumeTimer() {
    window.clearTimeout(this.timer)

    this.start = new Date()
    this.timer = setTimeout(this.hide, this.remaining)
  }

  pauseTimer() {
    const { persistOnHover } = this.props

    if (persistOnHover) {
      clearTimeout(this.timer)

      this.remaining -= new Date() - this.start
    }
  }

  render() {
    const { isVisible } = this.state
    const { children } = this.props

    return isVisible ? (
      <div
        className="FlashMessage"
        onMouseEnter={this.pauseTimer}
        onMouseLeave={this.resumeTimer}
      >
        {children}
      </div>
    ) : null
  }
}

FlashMessage.defaultProps = {
  duration: 5000,
  children: null,
  persistOnHover: true
}

FlashMessage.propTypes = {
  children: node,
  duration: number,
  persistOnHover: bool
}

export default FlashMessage
