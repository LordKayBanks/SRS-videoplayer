import React, { useEffect } from 'react'
import { store } from 'react-notifications-component'

export default function PlaylistItem({
    file,
    currentlyPlaying,
    title,
    setCurrentlyPlaying,
    durationTextContent,
    ref,
    fileSeparator,
    scrollIntoView
}) {
    // const scroll = () => file.id === currentlyPlaying && scrollIntoView(file.id)
    // useEffect(() => {
    //     scroll()
    //     console.log('🚀 ', file.id, '===', currentlyPlaying)
    // })
    useEffect(() => {
        if (file.id === currentlyPlaying) {
            setTimeout(function () {
                let objControl = document.getElementById(file.id)

                objControl?.scrollIntoView()
                store.addNotification({
                    title: 'SR-Videoplayer',
                    message: 'New Video Playing..',
                    type: 'success',
                    insert: 'top',
                    container: 'top-left',
                    animationIn: ['animate__animated', 'animate__fadeIn'],
                    animationOut: ['animate__animated', 'animate__fadeOut'],
                    dismiss: {
                        duration: 10000,
                        onScreen: true
                    }
                })
            }, 1000)
        }

        // console.log('🚀 ==> useEffect ==> useEffect', useEffect)
    }, [currentlyPlaying, file.id])
    return (
        <li
            ref={ref}
            //  file={file}
            key={file.id}
            id={file.id}
            className={`${fileSeparator} ${
                file.id === currentlyPlaying ? 'active' : ''
            }`}
            title={title}
            //  disabled={isDisabled}
            onClick={e => {
                setCurrentlyPlaying(file.id, () => {})
            }}
        >
            <span className="video-title">
                {`${file.name}` || `${file.src}`}
            </span>
            <span className="video-duration">{durationTextContent}</span>
        </li>
    )
}
