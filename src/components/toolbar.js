import './toolbar.css'

import React, { useState } from 'react'

import Buttons from './buttons'
import Playlist from './playlist'
import SortingOption from './SortingOption'

export default function Toolbar({ files = [], onSelectPlaylistItem = null }) {
  const [toolbarOpen, setToolbarOpen] = useState(true)
  const [videolink, setVideolink] = useState('')
  const [sortType, setSortType] = useState('')

  return (
    <div className={`toolbar ${toolbarOpen ? 'toolbar-open' : ''}`}>
      {toolbarOpen && <SortingOption setSortType={setSortType} />}
      {toolbarOpen && (
        <Playlist
          files={files}
          onSelectPlaylistItem={onSelectPlaylistItem}
        ></Playlist>
      )}
      <input
        onChange={e => setVideolink(e.target.value)}
        value={videolink}
        id="external-link"
        type="text"
        className="external-link"
        placeholder="Paste link here..."
        name="text"
      />
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
