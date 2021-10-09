import React from 'react'

export default function BuildPlaylist({
    files,
    currentlyPlaying,
    setCurrentlyPlaying
}) {
    const result = files.map((file, index) => {
        const isSeparator = file.type === 'separator'
        let title = isSeparator ? file.name : file.split
        // let isDisabled = isSeparator ? true : false
        let durationTextContent = isSeparator ? ' ' : '--:--'
        let fileSeparator = isSeparator ? 'file-separator' : ''

        return (
            <li
                //  file={file}
                key={file.id}
                id={file.id}
                className={`${fileSeparator} ${
                    // index === this.state.currentlyPlaying ? 'active' : ''
                    file.id === currentlyPlaying ? 'active' : ''
                }`}
                //  className={index === this.state.currentlyPlaying ? 'active' : ''}
                title={title}
                //  disabled={isDisabled}
                onClick={e => {
                    setCurrentlyPlaying(file.id, () => {
                        console.log(
                            '1================================================'
                        )

                        console.error(
                            'currentlyPlaying',
                            currentlyPlaying,
                            'file.id',
                            file.id
                        )

                        console.log(
                            '2================================================'
                        )
                    })
                    // this.setState({ currentlyPlaying: index }, () => {
                    //   this.props.handlePlay(file.path)
                    //   console.log('1================================================')
                    //   console.log('🚀 ~ file: file.path', file.path)
                    //   console.log('2================================================')
                    // })
                }}
            >
                <span className="video-title">
                    {`${file.name}` || `${file.src}`}
                </span>
                <span className="video-duration">{durationTextContent}</span>
            </li>
        )
        // file.e = LI
    })

    //  console.log('🚀 Playlist ~ returnfiles.map ~ LI', result)
    return result
}
