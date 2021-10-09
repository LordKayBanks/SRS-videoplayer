import './playlist.scss'

import React, { Component } from 'react'

import axios from 'axios'
import { drop } from '../player/drag'
import { parseYoutubeUrl } from '../utility/youtube'
import playlistCreator from '../utility/playlistCreator'
import { uuid } from 'uuidv4'
import BuildPlaylist from './buildPlaylist'

class Playlist extends Component {
    state = {
        drag: false,
        dragClassName: ''
        // playlist: [],
        // currentlyPlaying: null
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
        div.addEventListener('drop', this.handleTextDropEnd)
        //==
        div.addEventListener('dragenter', this.handleDragIn)
        div.addEventListener('dragleave', this.handleDragOut)
        div.addEventListener('dragover', this.handleDrag)
        div.addEventListener('drop', this.handleFileDrop)
    }

    componentWillUnmount() {
        let div = this.dropRef.current

        if (!div) return
        div.removeEventListener('dragstart', this.handleTextDropStart)
        div.removeEventListener('drop', this.handleTextDropEnd)
        //==
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

    handleTextDropEnd = async event => {
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
                        playlist: playlistCreator.entries
                        // currentlyPlaying: playlistItem.id
                    },
                    () => {
                        // this.props.handlePlay(playlistItem.path)
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
            this.props.setPlaylist(playlistCreator.entries, () => {})
            // this.setState({ playlist: playlistCreator.entries })
            // console.log('🚀playlistCreator.entries', playlistCreator.entries)
        }
    }

    loadReviews = () => {
        playlistCreator.loadReviews(this.props.sortType)
        this.props.setPlaylist(playlistCreator.entries, () => {})
        //  this.setState({ playlist: playlistCreator.entries }, () => {
        //    // console.log('🚀 Reviews', this.state.playlist)
        //  })
    }

    loadPlaylist = () => {
        playlistCreator.loadPlaylistFromStorage()
        this.props.setPlaylist(playlistCreator.entries, () => {})
        //  this.setState({ playlist: playlistCreator.entries }, () => {
        //    // console.log('🚀 Playlist', this.state.playlist)
        //  })
    }

    render() {
        return (
            <ul
                className={`playlist ${this.props.hidePlaylist} ${this.state.dragClassName}`}
                //   ref={this.dropRef}
                ref={this.props.sortType === 'playlist' ? this.dropRef : null}
            >
                {/* {this.buildPlaylist(this.state.playlist)} */}
                {/* {this.buildPlaylist(this.props.playlist)} */}
                <BuildPlaylist
                    files={this.props.playlist}
                    currentlyPlaying={this.props.currentlyPlaying}
                    setCurrentlyPlaying={this.props.setCurrentlyPlaying}
                ></BuildPlaylist>
            </ul>
        )
    }
}

export default Playlist
