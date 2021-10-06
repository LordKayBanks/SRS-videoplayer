import './toolbar.css'

import React, { useState } from 'react'

import Buttons from './buttons'
import Playlist from './playlist'
import SortingOption from './SortingOption'

export default function Toolbar({
  files = [],
  notify,
  onSelectPlaylistItem = null
}) {
  //   console.error('🚀 ~ file: toolbar.js ~ line 14 ~ files', files)

  const [toolbarOpen, setToolbarOpen] = useState(true)
  const [videolink, setVideolink] = useState('')
  const [sortType, setSortType] = useState('')

  return (
    <div className={`toolbar ${toolbarOpen ? 'toolbar-open' : 'hide-toolbar'}`}>
      {toolbarOpen && <SortingOption setSortType={setSortType} />}
      <Playlist
        hidePlaylist={`${toolbarOpen ? '' : 'hide-playlist'}`}
        files={files}
        notify={notify}
        onSelectPlaylistItem={onSelectPlaylistItem}
      ></Playlist>

      {toolbarOpen && (
        <input
          onChange={e => setVideolink(e.target.value)}
          value={videolink}
          id="external-link"
          type="text"
          className="external-link"
          placeholder="Paste link here..."
          name="text"
        />
      )}
      <Buttons
        horizontalButtons={`${toolbarOpen ? 'horizontal-buttons' : ''}`}
        boost={2}
        speed={2}
        togglePToolbar={() => {
          setToolbarOpen(!toolbarOpen)
        }}
        shufflePlaylist={() => {}}
        changeTrackingMode={() => {}}
        changeReviewMode={() => {}}
        changeRepeatMode={() => {}}
        changeSpeed={() => {}}
        changeBoost={() => {}}
        previousVideo={() => {}}
        nextVideo={() => {}}
      ></Buttons>
    </div>
  )
}
