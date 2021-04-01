import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'

const LoadButton = ({ className, selectedList, selectedLists, updateSelectedList, removeFilter }) => {
  const [selectedFilterName, setSelectedFilterName] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [show, setShow] = useState(true)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  let sortedLists = Object.entries(selectedLists)
  sortedLists = sortedLists.sort(function (a, b) {
    return b[0] - a[0]
  })

  const filtersJsx = sortedLists.map((list, i) => {
    const [name, filterList] = list
    console.log(filterList)

    const handleClick = () => {
      setSelectedFilterName(name)
      setSelectedFilter(filterList)
    }
    const handleDelete = () => removeFilter(name)
    return (
      <ListGroup.Item key={i} as="li" active={name === selectedFilterName} onClick={handleClick}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{name} {filterList.map((list, i) => <Badge className='mr-1 text-white' key={i} variant="secondary">{list.name}</Badge>)}</span>
          <Button onClick={handleDelete} variant='danger'>Delete</Button>
        </div>
      </ListGroup.Item>
    )
  })

  const handleLoad = () => {
    if (selectedFilterName) {
      updateSelectedList(selectedFilter)
    }
    handleClose()
  }

  return (
    <span className={className}>
      <Button variant="primary" onClick={handleShow}>
        Load
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Load Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <ListGroup as="ul">
            {filtersJsx}
          </ListGroup>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className='text-white' onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleLoad}>
            Load Filter
          </Button>
        </Modal.Footer>
      </Modal>
    </span>
  )
}

export default LoadButton
