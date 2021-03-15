import React, { useState, useEffect } from 'react'

import useSound from 'use-sound'

import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'

import FilterNotes from '../FilterNotes/FilterNotes'

const Game = ({ allNotes, uniqueTags }) => {
  const [filteredNotes, setFilteredNotes] = useState([])
  const [questionNotes, setQuestionNotes] = useState([])
  const [answerNote, setAnswerNote] = useState(null)
  const [playAudio, { stop: stopAudio }] = useSound(answerNote ? answerNote.soundUrl : null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState(false)
  const [selectedAnswerNote, setSelectedAnswerNote] = useState(null)
  const [answerNoteIndex, setAnswerNoteIndex] = useState(0)
  const [isQuestionLatin, setIsQuestionLatin] = useState(true)
  const [incorrectNotes, setIncorrectNotes] = useState([])
  const questionField = isQuestionLatin ? 'latinField' : 'englishField'
  const answerField = isQuestionLatin ? 'englishField' : 'latinField'

  const handleNextQuestion = () => {
    if (filteredNotes.length <= 4) {
      return
    }
    const filteredNotesCopy = filteredNotes.map(note => note)
    const randomNotes = []
    while (randomNotes.length < 4) {
      const randomIndex = randomNotes.length === 0 ? answerNoteIndex : Math.floor(Math.random() * filteredNotesCopy.length)
      const randomNote = filteredNotesCopy[randomIndex]
      filteredNotesCopy.splice(randomIndex, 1)
      randomNotes.push(randomNote)
    }

    const answerNote = randomNotes[0]

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    randomNotes.sort((note1, note2) => {
      const nameA = note1[answerField].toUpperCase() // ignore upper and lowercase
      const nameB = note2[answerField].toUpperCase() // ignore upper and lowercase
      if (nameA < nameB) {
        return -1
      } else if (nameA > nameB) {
        return 1
      }
      return 0
    })
    setQuestionNotes(randomNotes)

    // delay setting answer note because of use-sound race condition
    setTimeout(() => {
      setAnswerNote(answerNote)
      setShowAnswer(false)
      // set the next answer note to the next filtered card
      setAnswerNoteIndex(answerNoteIndex => (answerNoteIndex + 1) % filteredNotes.length)
    }, 100)
    console.log('answerNote', answerNote)

    stopAudio()
  }

  useEffect(() => {
    if (filteredNotes.length > 4) {
      handleNextQuestion()
      setAnswerNoteIndex(0)
    }
  }, [filteredNotes])

  useEffect(() => {
    if (answerNote && isQuestionLatin) {
      playAudio()
      console.log('playing audio', answerNote ? answerNote.soundUrl : '')
    }
  }, [playAudio])

  const checkAnswer = note => {
    // we're already showing the answer, ignore this click
    if (showAnswer) {
      return
    }

    setShowAnswer(true)
    setCorrectAnswer(answerNote[questionField] === note[questionField])
    setSelectedAnswerNote(note)
    if (answerNote && !isQuestionLatin) {
      playAudio()
    }

    if (answerNote[questionField] !== note[questionField]) {
      setIncorrectNotes(incorrectNotes => [...incorrectNotes, answerNote])
    }

    // scroll to bottom
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100)
  }

  const questionJsx = answerNote && (
    <h1 className="mt-3 mb-0 px-2 py-1 bg-secondary text-white">
      {(isQuestionLatin || showAnswer) && <span style={{ cursor: 'pointer' }} onClick={playAudio}>▶️</span>}
      {' '}{answerNote[questionField]} ({answerNoteIndex !== 0 ? answerNoteIndex : filteredNotes.length}/{filteredNotes.length})
    </h1>
  )
  const notesJsx = answerNote && questionNotes.map((note, i) => {
    let variant = ''
    if (showAnswer && answerNote[questionField] === note[questionField]) {
      variant = 'success'
    } else if (showAnswer && !correctAnswer && selectedAnswerNote[questionField] === note[questionField]) {
      variant = 'danger'
    }

    return (
      <ListGroup.Item key={i} action={!showAnswer} variant={variant} onClick={() => checkAnswer(note)}>
        {note[answerField]} {showAnswer && <strong>- {note[questionField]}</strong>}
      </ListGroup.Item>
    )
  })

  const nextQuestionButtonJsx = showAnswer && (
    <Button className='text-white' variant="primary" size="lg" onClick={handleNextQuestion}>
      Next Question
    </Button>
  )

  const incorrectNotesJsx = incorrectNotes.length > 0 && (
    <Accordion className="mt-3">
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="0" style={{
          color: '#721c24',
          backgroundColor: '#f5c6cb'
        }}>
          Incorrect Answers (Click to Show/Hide)
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <ListGroup>
            {incorrectNotes.map((note, i) => (
              <ListGroup.Item key={i} onClick={() => checkAnswer(note)}>
                {note[answerField]} {<strong>- {note[questionField]}</strong>}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  )

  return (
    <div className="row">
      <div className="col-sm-10 col-md-8 mx-auto mt-3">
        <h3 className='text-primary'>Vocab Game</h3>
        <h4 className='text-secondary'>Question Language</h4>
        <ListGroup horizontal className='mb-2'>
          <ListGroup.Item
            action
            className={isQuestionLatin && 'text-white'}
            variant={isQuestionLatin && 'primary'}
            onClick={() => setIsQuestionLatin(true)}>
            <strong>Latin</strong>
          </ListGroup.Item>
          <ListGroup.Item
            action
            className={!isQuestionLatin && 'text-white'}
            variant={!isQuestionLatin && 'primary'}
            onClick={() => setIsQuestionLatin(false)}>
            <strong>English</strong>
          </ListGroup.Item>
        </ListGroup>
        <FilterNotes action allNotes={allNotes} uniqueTags={uniqueTags} setFilteredNotes={setFilteredNotes} />
        {questionJsx}
        <ListGroup>
          {notesJsx}
        </ListGroup>

        {nextQuestionButtonJsx}
        {incorrectNotesJsx}
      </div>
    </div>
  )
}

export default Game
