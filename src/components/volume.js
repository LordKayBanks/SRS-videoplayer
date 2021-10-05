import React from 'react'

export default function Volume({ handleVolumeChange, volume }) {
  return (
    <>
      <th>Volume</th>
      <td>
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={volume}
          onChange={handleVolumeChange}
        />
      </td>
    </>
  )
}
