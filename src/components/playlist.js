import './playlist.scss'

import { parseYoutubeUrl } from '../utility/youtube'

import React, { Component } from 'react'
import { uuid } from 'uuidv4'
import axios from 'axios'

import { drop } from '../player/drag'
import playlistCreator from '../utility/playlistCreator'

class Playlist extends Component {
  state = {
    drag: false,
    dragClassName: ''
    //  playlist: [],
    //  currentlyPlaying: null
  }

  dropRef = React.createRef()

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.sortType !== this.props.sortType)
      if (this.props.sortType === 'playlist') {
        this.loadPlaylist()
      } else {
        this.loadReviews()
      }
  }

  componentDidMount() {
    if (this.props.sortType === 'playlist') {
      this.loadPlaylist()
    } else {
      this.loadReviews()
    }

    let div = this.dropRef.current

    if (!div) return
    div.addEventListener('dragstart', this.handleTextDropStart)
    div.addEventListener('drop', this.handleTextDrop)

    div.addEventListener('dragenter', this.handleDragIn)
    div.addEventListener('dragleave', this.handleDragOut)
    div.addEventListener('dragover', this.handleDrag)
    div.addEventListener('drop', this.handleFileDrop)
  }

  componentWillUnmount() {
    let div = this.dropRef.current

    if (!div) return
    div.removeEventListener('dragstart', this.handleTextDropStart)
    div.removeEventListener('drop', this.handleTextDrop)

    div.removeEventListener('dragenter', this.handleDragIn)
    div.removeEventListener('dragleave', this.handleDragOut)
    div.removeEventListener('dragover', this.handleDrag)
    div.removeEventListener('drop', this.handleFileDrop)
  }

  handleTextDropStart = event => {
    //  if (this.props.sortType !== 'playlist')
    //    return this.setState({ drag: true, dragClassName: 'wrong-list' })

    if (event.dataTransfer) {
      // Note: textData is empty here for Safari and Google Chrome :(
      event.dataTransfer.getData('Text')

      let newText = '...' //Modify the data being dragged BEFORE it is dropped.

      event.dataTransfer.setData('Text', newText)
    }
  }

  getMetadata = async url => {
    const videoUrl = url
    const requestUrl = `http://youtube.com/oembed?url=${videoUrl}&format=json`
    const result = await axios.get(requestUrl)

    return result.data
  }

  handleTextDrop = async event => {
    if (event.dataTransfer) {
      let videoURL = event.dataTransfer.getData('Text')

      if (videoURL) {
        let playlistItem = {
          name: videoURL,
          path: videoURL,
          type: 'external',
          id: uuid()
        }

        if (parseYoutubeUrl(videoURL)) {
          const videoInfo = await this.getMetadata(videoURL)

          if (videoInfo)
            playlistItem = {
              name: videoInfo.title,
              path: videoURL,
              type: 'video/external',
              id: uuid(),
              author: videoInfo.author_name,
              source: videoInfo.provider_name
            }
        }

        playlistCreator.loadVideo([playlistItem])
        this.props.setPlaylist(
          {
            playlist: playlistCreator.entries,
            currentlyPlaying: playlistItem.id
          },
          () => {
            this.props.handlePlay(playlistItem.path)

            //  this.props.handlePlay(videoURL)
          }
        )
        this.setState({
          dragClassName: ''
        })
      }
    } //else ... Some (less modern) browsers don't support dataTransfer objects.
    // =======================

    // Use stopPropagation and cancelBubble to prevent the browser
    // from performing the default `drop` action for this element.
    else if (event.stopPropagation) event.stopPropagation()
    else event.cancelBubble = true

    return false
  }

  handleDrag = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  handleDragIn = e => {
    e.preventDefault()
    e.stopPropagation()
    this.dragCounter++
    //  if (this.props.sortType !== 'playlist')
    //    return this.setState({ drag: true, dragClassName: 'wrong-list' })

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ drag: true, dragClassName: 'on-drag' })
    }
  }

  handleDragOut = e => {
    e.preventDefault()
    e.stopPropagation()
    this.dragCounter--
    this.setState({ dragClassName: '' })

    if (this.dragCounter === 0) {
      this.setState({ drag: false, dragClassName: '' })
    }
  }

  handleFileDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ drag: false, dragClassName: '' })

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // this.props.handleFileDrop(e.dataTransfer.files)
      drop([...e.dataTransfer.items], playlistCreator.loadVideo)
      e.dataTransfer.clearData()
      this.dragCounter = 0
      this.props.setPlaylist({ playlist: playlistCreator.entries }, () => {})
      // this.setState({ playlist: playlistCreator.entries })
      // console.log('🚀playlistCreator.entries', playlistCreator.entries)
    }
  }

  loadReviews = () => {
    playlistCreator.loadReviews(this.props.sortType)
    this.props.setPlaylist({ playlist: playlistCreator.entries }, () => {})
    //  this.setState({ playlist: playlistCreator.entries }, () => {
    //    // console.log('🚀 Reviews', this.state.playlist)
    //  })
  }

  loadPlaylist = () => {
    playlistCreator.loadPlaylistFromStorage()
    this.props.setPlaylist({ playlist: playlistCreator.entries }, () => {})
    //  this.setState({ playlist: playlistCreator.entries }, () => {
    //    // console.log('🚀 Playlist', this.state.playlist)
    //  })
  }

  buildPlaylist(files) {
    const result = files.map((file, index) => {
      const isSeparator = file.type === 'separator'
      let title = isSeparator ? file.name : file.split
      let isDisabled = isSeparator ? true : false
      let durationTextContent = isSeparator ? ' ' : '--:--'
      let fileSeparator = isSeparator ? 'file-separator' : ''

      return (
        <li
          //  file={file}
          key={file.id}
          id={file.id}
          className={`${fileSeparator} ${
            // index === this.state.currentlyPlaying ? 'active' : ''
            index === this.props.currentlyPlaying ? 'active' : ''
          }`}
          //  className={index === this.state.currentlyPlaying ? 'active' : ''}
          title={title}
          disabled={isDisabled}
          onClick={e => {
            this.props.setPlaylist({ currentlyPlaying: index }, () => {
              this.props.handlePlay(file.path)
              console.log('1================================================')
              console.log('🚀 ~ file: file.path', file.path)
              console.log('2================================================')
            })
            // this.setState({ currentlyPlaying: index }, () => {
            //   this.props.handlePlay(file.path)
            //   console.log('1================================================')
            //   console.log('🚀 ~ file: file.path', file.path)
            //   console.log('2================================================')
            // })
          }}
        >
          <span className="video-title">{`${file.name}` || `${file.src}`}</span>
          <span className="video-duration">{durationTextContent}</span>
        </li>
      )
      // file.e = LI
    })

    //  console.log('🚀 Playlist ~ returnfiles.map ~ LI', result)
    return result
  }

  render() {
    return (
      <ul
        className={`playlist ${this.props.hidePlaylist} ${this.state.dragClassName}`}
        //   ref={this.dropRef}
        ref={this.props.sortType === 'playlist' ? this.dropRef : null}
      >
        {/* {this.buildPlaylist(this.state.playlist)} */}
        {this.buildPlaylist(this.props.playlist)}
      </ul>
    )
  }

  //   render() {
  //     return (
  //       <ul className={`playlist ${this.props.hidePlaylist}`} ref={this.dropRef}>
  //         <li title="undefined" class="">
  //           <span data-id="name">
  //             27-1. Introduction to Explain VLAN Concepts and Configure VLANs on a
  //             Single Switch.mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">27-2. How VLANs Changed the World.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">27-3. Routing Between VLANs.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">
  //             27-4. Configuring VLANs on a Single Switch.mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">27-5. Configuring a Router on a Stick.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">
  //             27-6. Configuring VLANs on a Single Switch Lab.mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">
  //             27-7. Review of Explain VLAN Concepts and Configure VLANs on a
  //             Single Switch.mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title=" " class="file-separator">
  //           <span data-id="name"> </span>
  //           <span data-id="duration"> </span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">0001 Windows Flutter Install.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">0002 Windows Android Setup.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">0003 MacOS Flutter Install.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">0004 MacOS iOS Android Setup.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">
  //             0005 Turning VS Code Into a Flutter IDE.mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title=" " class="file-separator">
  //           <span data-id="name"> </span>
  //           <span data-id="duration"> </span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">001 What is a State.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">002 The setState() method.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">003 Stateful Widget in action.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">004 What is initState() function.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">005 Understanding Widget lifecycle.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title=" " class="file-separator">
  //           <span data-id="name"> </span>
  //           <span data-id="duration"> </span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">01. Networking Refresher - PART1.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">02. Networking Refresher - PART2.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">03. VPC Sizing and Structure - PART1.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">04. VPC Sizing and Structure - PART2.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">05. Custom VPCs.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined" class="">
  //           <span data-id="name">06. VPC Subnets.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title=" " class="file-separator">
  //           <span data-id="name"> </span>
  //           <span data-id="duration"> </span>
  //         </li>
  //         <li title="undefined" class="active">
  //           <span data-id="name">1.What Is Redux Saga.mp4</span>
  //           <span data-id="duration">00:01:13</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">7.Creating Your First Saga (Demo).mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">5.Setting up the Application (Demo).mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">3.Why Use Redux Saga.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">4.Redux Thunk vs. Redux Saga.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">2.What Is a Saga.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">8.Conclusion.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">
  //             6.Installing and Configuring Redux Saga (Demo).mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title=" " class="file-separator">
  //           <span data-id="name"> </span>
  //           <span data-id="duration"> </span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">1.Introduction.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">2.What Is Yield.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">
  //             3.Advantages and Disadvantages to Yield.mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">4.Generator Functions.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">5.Creating a Generator (Demo).mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">6.Yield and Promises.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">7.Wrapping Generators.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">
  //             8.Wrapping Generators with Redux Saga and Co (Demo).mp4
  //           </span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title="undefined">
  //           <span data-id="name">9.Summary.mp4</span>
  //           <span data-id="duration">--:--</span>
  //         </li>
  //         <li title=" " class="file-separator">
  //           <span data-id="name"> </span>
  //           <span data-id="duration"> </span>
  //         </li>
  //       </ul>
  //     )
  //   }
}

export default Playlist
