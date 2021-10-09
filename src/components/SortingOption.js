import './SortingOption.css'

import React from 'react'

export default function SelectSortingOption({ setSortType }) {
  return (
    <div className="review-sort-options-container">
      <section className="sort-text">Sortby:</section>
      <select
        id="review-sort"
        className="review-sort-options"
        onChange={e => setSortType(e.target.value)}
      >
        <optgroup>
          <option value="playlist" selected="selected">
            Standard Playlist
          </option>
        </optgroup>
        <optgroup>
          <option value="time-descending">Time descending</option>
          <option value="time-ascending">Time ascending</option>
        </optgroup>
        <optgroup>
          <option value="same-folder">In same folder</option>
          <option value="same-parent-folder">In same parent folder</option>
        </optgroup>
        <optgroup>
          <option value="count-descending">Count descending</option>
          <option value="count-ascending">Count ascending</option>
        </optgroup>
      </select>
    </div>
  )
}
