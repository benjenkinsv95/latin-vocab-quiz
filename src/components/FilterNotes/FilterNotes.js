import React, { useEffect } from 'react'
import { Multiselect } from 'multiselect-react-dropdown'
import { knuthShuffle as shuffle } from 'knuth-shuffle'

const loadSelectedValues = () => {
  const selectedValues = localStorage.getItem('selectedValues') || '[]'

  return JSON.parse(selectedValues)
}

const FilterNotes = ({ allNotes, uniqueTags, setFilteredNotes }) => {
  const uniqueTagsOptions = uniqueTags.map((tag, i) => ({ name: tag, id: i + 1 }))

  const setSelectedList = (selectedList) => {
    const newFilteredTags = selectedList.map(option => option.name)
    const filteredNotes = allNotes.filter(note => note.tags.some(tag => newFilteredTags.includes(tag.toLowerCase())))
    setFilteredNotes(shuffle(filteredNotes))
    localStorage.setItem('selectedValues', JSON.stringify(selectedList))
  }

  useEffect(() => {
    setSelectedList(loadSelectedValues())
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
        selectedValues={loadSelectedValues()} // Preselected value to persist in dropdown
        onSelect={setSelectedList} // Function will trigger on select event
        onRemove={setSelectedList} // Function will trigger on remove event
        displayValue="name" // Property name to display in the dropdown options
      />
    </div>
  )
}

export default FilterNotes
