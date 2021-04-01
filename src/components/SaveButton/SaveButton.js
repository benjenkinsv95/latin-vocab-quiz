import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'

const SaveButton = ({ className, selectedList, selectedLists, saveFilter }) => {
  const [filterName, setFilterName] = useState('')

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const handleSave = () => {
    saveFilter(filterName, selectedList)
    handleClose()
  }

  const dataListOptionsJsx = Object.keys(selectedLists).map((filterName, i) => <option key={i} value={filterName}/>)

  return (
    <span className={className}>
      <Button variant="secondary" className='text-white' onClick={handleShow}>
        Save
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Save Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form.Group controlId="formBasicEmail">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" list="filter-names" placeholder="Enter filter name" value={filterName} onChange={e => setFilterName(e.target.value)}/>
            <Form.Text className="text-muted">
            Choose a name for your filter
            </Form.Text>
          </Form.Group>

          <datalist id="filter-names">
            {dataListOptionsJsx}
          </datalist>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className='text-white' onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Filter
          </Button>
        </Modal.Footer>
      </Modal>
    </span>
  )
}

export default SaveButton
