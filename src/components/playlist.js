import './playlist.css'

import * as utility from '../utility/index'

import React, { Component } from 'react'
import { drop } from '../player/drag'
import playlistCreator from './playlistCreator'

class Playlist extends Component {
  state = {
    isReviewing: false,
    unsubscribeToReview: null,
    unsubscribeSkipOnPlayError: null,
    stats: new WeakMap(),
    delayId: null,
    state: -1, // current playing state
    //  =========
    PlayerState: {
      UNSTARTED: -1,
      ENDED: 0,
      PLAYING: 1,
      PAUSED: 2,
      BUFFERING: 3,
      CUED: 5
    },
    configs: {
      delay: 1500
    },
    entries: [],
    index: -1, // c
    files: []
  }

  componentDidMount() {
    document.addEventListener('drop', e => {
      e.preventDefault()
      drop([...e.dataTransfer.items], playlistCreator.loadVideo)
    })

    document.addEventListener('dragover', e => e.preventDefault())
  }

  buildPlaylist(files) {
    return files.map((file, i) => {
      const isSeparator = file.type === 'separator'
      let title = isSeparator ? file.name : file.split
      let isDisabled = isSeparator ? true : false
      let durationTextContent = isSeparator ? ' ' : '--:--'
      const LI = (
        <li
          key={i}
          id={'name'}
          className={isSeparator ? 'file-separator' : ''}
          title={title}
          disabled={isDisabled}
          file={file}
        >
          <span>{`${file.name}` || `${file.src}`}</span>
          <span>{durationTextContent}</span>
        </li>
      )

      file.e = LI

      return LI
    })
  }

  //   render() {
  //     ;<ul className={`playlist ${this.props.hidePlaylist}`}>
  //       {this.buildPlaylist(this.state.files)}
  //       <OldList></OldList>
  //     </ul>
  //   }

  render() {
    return (
      <ul className={`playlist ${this.props.hidePlaylist}`}>
        <li title="undefined" class="">
          <span data-id="name">
            27-1. Introduction to Explain VLAN Concepts and Configure VLANs on a
            Single Switch.mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">27-2. How VLANs Changed the World.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">27-3. Routing Between VLANs.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">
            27-4. Configuring VLANs on a Single Switch.mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">27-5. Configuring a Router on a Stick.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">
            27-6. Configuring VLANs on a Single Switch Lab.mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">
            27-7. Review of Explain VLAN Concepts and Configure VLANs on a
            Single Switch.mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title=" " class="file-separator">
          <span data-id="name"> </span>
          <span data-id="duration"> </span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">0001 Windows Flutter Install.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">0002 Windows Android Setup.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">0003 MacOS Flutter Install.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">0004 MacOS iOS Android Setup.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">
            0005 Turning VS Code Into a Flutter IDE.mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title=" " class="file-separator">
          <span data-id="name"> </span>
          <span data-id="duration"> </span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">001 What is a State.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">002 The setState() method.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">003 Stateful Widget in action.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">004 What is initState() function.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">005 Understanding Widget lifecycle.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title=" " class="file-separator">
          <span data-id="name"> </span>
          <span data-id="duration"> </span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">01. Networking Refresher - PART1.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">02. Networking Refresher - PART2.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">03. VPC Sizing and Structure - PART1.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">04. VPC Sizing and Structure - PART2.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">05. Custom VPCs.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined" class="">
          <span data-id="name">06. VPC Subnets.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title=" " class="file-separator">
          <span data-id="name"> </span>
          <span data-id="duration"> </span>
        </li>
        <li title="undefined" class="active">
          <span data-id="name">1.What Is Redux Saga.mp4</span>
          <span data-id="duration">00:01:13</span>
        </li>
        <li title="undefined">
          <span data-id="name">7.Creating Your First Saga (Demo).mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">5.Setting up the Application (Demo).mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">3.Why Use Redux Saga.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">4.Redux Thunk vs. Redux Saga.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">2.What Is a Saga.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">8.Conclusion.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">
            6.Installing and Configuring Redux Saga (Demo).mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title=" " class="file-separator">
          <span data-id="name"> </span>
          <span data-id="duration"> </span>
        </li>
        <li title="undefined">
          <span data-id="name">1.Introduction.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">2.What Is Yield.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">
            3.Advantages and Disadvantages to Yield.mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">4.Generator Functions.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">5.Creating a Generator (Demo).mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">6.Yield and Promises.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">7.Wrapping Generators.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">
            8.Wrapping Generators with Redux Saga and Co (Demo).mp4
          </span>
          <span data-id="duration">--:--</span>
        </li>
        <li title="undefined">
          <span data-id="name">9.Summary.mp4</span>
          <span data-id="duration">--:--</span>
        </li>
        <li title=" " class="file-separator">
          <span data-id="name"> </span>
          <span data-id="duration"> </span>
        </li>
      </ul>
    )
  }
}

export default Playlist
