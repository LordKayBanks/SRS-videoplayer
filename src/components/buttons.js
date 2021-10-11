import './buttons.scss'

import React from 'react'

export default function Buttons({
    trackingMode,
    setupForStandardTrackingMode,
    setupReviewMode,
    reviewMode,
    horizontalButtons,
    boost = 3,
    speed = 2,
    toggleRepeatMode,
    repeatMode,
    togglePToolbar = () => {},
    shufflePlaylist = () => {},
    changeTrackingMode = () => {},
    changeSpeed = () => {},
    changeBoost = () => {},
    previousVideo = () => {},
    nextVideo = () => {}
}) {
    const changeReviewMode = e => {
        if (reviewMode === 'active') {
            setupReviewMode({ loopCurrentSplit: true })
        } else if (reviewMode === 'loop') {
            setupReviewMode({ activate: false })
        } else if (reviewMode === 'inactive') {
            setupReviewMode({ activate: true })
        }
    }

    return (
        <div className={`buttons ${horizontalButtons}`}>
            <input
                onChange={togglePToolbar}
                type="checkbox"
                id="p-button"
                title="Toggle Playlist (Ctrl + P or Command + P)"
            />

            <label htmlFor="p-button" id="p-button-view">
                <svg width="22" height="22" viewBox="0 0 22 22">
                    <rect width="16" height="2" x="3" y="3"></rect>
                    <rect width="16" height="2" x="3" y="9"></rect>
                    <rect width="16" height="2" x="3" y="15"></rect>
                </svg>
            </label>

            <label
                onClick={shufflePlaylist}
                className="shuffle"
                title="Shuffle Playlist"
            >
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M6.6,5.2 L1.4,0 L0,1.4 L5.2,6.6 L6.6,5.2 L6.6,5.2 Z M10.5,0 L12.5,2 L0,14.6 L1.4,16 L14,3.5 L16,5.5 L16,0 L10.5,0 L10.5,0 Z M10.8,9.4 L9.4,10.8 L12.5,13.9 L10.5,15.9 L16,15.9 L16,10.4 L14,12.4 L10.8,9.4 L10.8,9.4 Z"></path>
                </svg>
            </label>

            <label
                onClick={setupForStandardTrackingMode}
                id="trackingMode"
                 className={`tracking-btn-${trackingMode}`}
                title="Tracking Mode"
            >
                <svg width="22" height="22" viewBox="0 0 48 48">
                    <text
                        x="50%"
                        y="50%"
                        alignmentBaseline="middle"
                        textAnchor="middle"
                        fontSize="30"
                    >
                        T
                    </text>
                </svg>
            </label>

            <label
                onClick={changeReviewMode}
                className={`review-btn-${reviewMode}`}
                id="reviewMode"
                data-mode="inactive"
                title="Review Mode"
            >
                <svg width="22" height="22" viewBox="0 0 48 48">
                    <text
                        x="50%"
                        y="50%"
                        alignmentBaseline="middle"
                        textAnchor="middle"
                        fontSize="30"
                    >
                        R
                    </text>
                </svg>
            </label>

            <label
                onClick={toggleRepeatMode}
                className={`repeat ${
                    repeatMode !== 'no-repeat' ? 'active' : ''
                }`}
                title="Repeat Mode: no repeat, repeat one, repeat all"
            >
                <svg width="22" height="22" viewBox="0 0 48 48">
                    {repeatMode === 'repeat-one' ? (
                        <path d="M14 14h20v6l8-8-8-8v6H10v12h4v-8zm20 20H14v-6l-8 8 8 8v-6h24V26h-4v8zm-8-4V18h-2l-4 2v2h3v8h3z"></path>
                    ) : (
                        <path d="M14 14h20v6l8-8-8-8v6H10v12h4v-8zm20 20H14v-6l-8 8 8 8v-6h24V26h-4v8z"></path>
                    )}
                </svg>
            </label>

            <label
                onClick={changeSpeed}
                id="speed"
                data-mode="4x"
                title="Adjust player's speed (2X [default], 3X, 3.5X, 4X, 4.5X and 5X) (Shortcut: S)"
            >
                <svg width="22" height="22" viewBox="0 0 48 48">
                    <text
                        x="50%"
                        y="50%"
                        alignmentBaseline="middle"
                        textAnchor="middle"
                        fontSize="24"
                    >
                        {`${speed}X`}
                    </text>
                </svg>
            </label>

            <label
                onClick={changeBoost}
                className="boost"
                data-mode="3b"
                title="Adjust player's volume boost (2B [default], 3B, 4B) (Ctrl + B or Command + B)"
            >
                <svg width="22" height="22" viewBox="0 0 48 48">
                    <text
                        x="50%"
                        y="50%"
                        alignmentBaseline="middle"
                        textAnchor="middle"
                        fontSize="24"
                    >
                        {`${boost}B`}
                    </text>
                </svg>
            </label>

            <label
                onClick={previousVideo}
                className="previous"
                title="Play Previous Song (Ctrl + Shift + P or Command + Shift + P)"
            >
                <svg width="16" height="16" viewBox="0 0 32 32">
                    <path d="M29.46,5.11a1,1,0,0,0-1,.08L18,12.63V6a1,1,0,0,0-1.58-.81l-14,10a1,1,0,0,0,0,1.63l14,10A1,1,0,0,0,18,26V19.37l10.42,7.44A1,1,0,0,0,30,26V6A1,1,0,0,0,29.46,5.11Z"></path>
                </svg>
            </label>

            <label
                onClick={nextVideo}
                className="next"
                title="Play Next Song (Ctrl + Shift + N or Command + Shift + N)"
            >
                <svg width="22" height="22" viewBox="0 0 24 24">
                    <path
                        d="M22.2,10.6l-9-5.4c-1-0.6-2.2,0.2-2.2,1.4v3.2L3.2,5.2C2.2,4.6,1,5.4,1,6.6v10.7c0,1.2,1.2,2,2.2,1.4l7.8-4.6   v3.2c0,1.2,1.2,2,2.2,1.4l9-5.4C23.3,12.8,23.3,11.2,22.2,10.6z"
                        id="next"
                    ></path>
                </svg>
            </label>
        </div>
    )
}
