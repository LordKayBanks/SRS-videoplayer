import React, { useEffect } from 'react'
import './playlistItem.scss'

export default function PlaylistItem({
    file,
    currentlyPlaying,
    title,
    setCurrentlyPlaying,
    durationTextContent,
    ref,
    fileSeparator,
    category,
    setCurrentCategory,
    scrollIntoView,
    isDisabled
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
            }, 1000)
        }
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
            disabled={isDisabled}
            onClick={e => {
                setCurrentlyPlaying(file.id, () => {})
            }}
        >
            {category && (
                <label className='category-checkbox'>
                    <input
                        className="category"
                        type="checkbox"
                        id={file.id}
                        name="category"
                        value={category}
                        onClick={e => {
                            const value = e.target.value
                            const action = e.target.checked ? true : false

                            setCurrentCategory(value, action)
                        }}
                    />
                    <i></i>
                    <span></span>
                </label>
            )}
            <span className="video-title">
                {`${file.name}` || `${file.src}`}
            </span>
            <span className="video-duration">{durationTextContent}</span>
        </li>
    )
}
