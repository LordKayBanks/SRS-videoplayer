import './toolbar.css'

import React, { useState } from 'react'

import Buttons from './buttons'
import Playlist from './playlist'
import SelectSortingOption from './SortingOption'

export default function Toolbar({
    notify,
    currentlyPlaying,
    setCurrentlyPlaying,
    playlist,
    setPlaylist,
    onSelectPlaylistItem = null,
    handlePrevious,
    handleNext,
    toggleRepeatMode,
    repeatMode,
    setCurrentCategory,
    trackingMode,
    setupForStandardTrackingMode,
    setupReviewMode,
    reviewMode,
    setSortType,
    sortType
}) {
    const [toolbarOpen, setToolbarOpen] = useState(true)

    function onAddNewURL(e) {
        if (e.key === 'Enter') {
            // playNewVideo(e.target.value)
        }
    }

    return (
        <div
            className={`toolbar ${
                toolbarOpen ? 'toolbar-open' : 'hide-toolbar'
            }`}
        >
            {toolbarOpen && (
                <SelectSortingOption
                    setSortType={setSortType}
                    setupReviewMode={setupReviewMode}
                />
            )}
            <Playlist
                setCurrentCategory={setCurrentCategory}
                setPlaylist={setPlaylist}
                playlist={playlist}
                setCurrentlyPlaying={setCurrentlyPlaying}
                currentlyPlaying={currentlyPlaying}
                sortType={sortType}
                hidePlaylist={`${toolbarOpen ? '' : 'hide-playlist'}`}
                notify={notify}
                onSelectPlaylistItem={onSelectPlaylistItem}
            ></Playlist>

            {toolbarOpen && (
                <input
                    onKeyDown={onAddNewURL}
                    id="external-link"
                    type="text"
                    className="external-link"
                    placeholder="Paste link here...or drag and drop"
                    name="text"
                />
            )}
            <Buttons
                reviewMode={reviewMode}
                setupReviewMode={setupReviewMode}
                trackingMode={trackingMode}
                setupForStandardTrackingMode={setupForStandardTrackingMode}
                horizontalButtons={`${toolbarOpen ? 'horizontal-buttons' : ''}`}
                boost={2}
                speed={2}
                togglePToolbar={() => {
                    setToolbarOpen(!toolbarOpen)
                }}
                toggleRepeatMode={toggleRepeatMode}
                repeatMode={repeatMode}
                shufflePlaylist={() => {}}
                changeTrackingMode={() => {}}
                changeReviewMode={() => {}}
                changeRepeatMode={() => {}}
                changeSpeed={() => {}}
                changeBoost={() => {}}
                previousVideo={handlePrevious}
                nextVideo={handleNext}
            ></Buttons>
        </div>
    )
}
