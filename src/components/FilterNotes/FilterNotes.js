import React, { useEffect, useState } from 'react'
import { Multiselect } from 'multiselect-react-dropdown'
import { knuthShuffle as shuffle } from 'knuth-shuffle'

import SaveButton from '../SaveButton/SaveButton'
import LoadButton from '../LoadButton/LoadButton'

const loadSelectedList = () => {
  const selectedList = localStorage.getItem('selectedList') || '[]'

  return JSON.parse(selectedList)
}

// used for load/save buttons
const loadSelectedLists = () => {
  const selectedLists = localStorage.getItem('selectedLists') || '{}'

  return JSON.parse(selectedLists)
}

const FilterNotes = ({ allNotes, uniqueTags, setAllFilteredNotes }) => {
  const uniqueTagsOptions = uniqueTags.map((tag, i) => ({ name: tag, id: i + 1 }))
  const [selectedList, setSelectedList] = useState(loadSelectedList())

  const [selectedLists, setSelectedLists] = useState(loadSelectedLists())
  const saveFilter = (filterName, selectedList) => {
    const updatedLists = { ...selectedLists }
    updatedLists[filterName] = selectedList
    setSelectedLists(updatedLists)
    console.log('selectedLists', updatedLists)

    localStorage.setItem('selectedLists', JSON.stringify(updatedLists))
  }

  const removeFilter = filterName => {
    const updatedLists = { ...selectedLists }
    delete updatedLists[filterName]
    setSelectedLists(updatedLists)
    console.log('selectedLists', updatedLists)

    localStorage.setItem('selectedLists', JSON.stringify(updatedLists))
  }

  const updateSelectedList = (newSelectedList) => {
    setSelectedList(newSelectedList)
    const newFilteredTags = newSelectedList.map(option => option.name).sort()
    const filteredNotes = allNotes.filter(note => note.tags.some(tag => newFilteredTags.includes(tag.toLowerCase())))
    setAllFilteredNotes(shuffle(filteredNotes))
    localStorage.setItem('selectedList', JSON.stringify(newSelectedList))
  }

  useEffect(() => {
    updateSelectedList(selectedList)
  }, [])

  return (
    <div>
      <h4 className='text-secondary'>Filter by Tag</h4>

      <Multiselect
        style={{
          chips: {
            backgroundColor: '#2a9d8f'
          },
          option: { // To change css for dropdown options
            color: '#2a9d8f'
          }
        }}
        options={uniqueTagsOptions} // Options to display in the dropdown
        selectedValues={loadSelectedList()} // Preselected value to persist in dropdown
        onSelect={updateSelectedList} // Function will trigger on select event
        onRemove={updateSelectedList} // Function will trigger on remove event
        displayValue="name" // Property name to display in the dropdown options
      />
      <div className='text-right mt-2'>
        <SaveButton className='mr-2' selectedList={selectedList} selectedLists={selectedLists} saveFilter={saveFilter} />
        <LoadButton selectedLists={selectedLists} updateSelectedList={updateSelectedList} removeFilter={removeFilter} />
      </div>
    </div>
  )
}

export default FilterNotes
