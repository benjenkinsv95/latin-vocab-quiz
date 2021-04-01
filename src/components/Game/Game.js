import React, { useState, useEffect } from 'react'

import useSound from 'use-sound'

import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import { knuthShuffle as shuffle } from 'knuth-shuffle'

import FilterNotes from '../FilterNotes/FilterNotes'

const Game = ({ allNotes, uniqueTags }) => {
  // All notes that match the filters
  const [allFilteredNotes, setAllFilteredNotes] = useState([])
  // All notes that were incorrect
  const [incorrectNotes, setIncorrectNotes] = useState([])
  // The current question notes. Either allFilteredNotes or the incorrectNotes fo review
  const [questionNotes, setQuestionNotes] = useState([])
  // The notes used for possible answers
  const [possibleAnswerNotes, setPossibleAnswerNotes] = useState([])

  // The note that is the correct answer and the note the user selected
  const [correctAnswerNote, setCorrectAnswerNote] = useState(null)
  const [selectedAnswerNote, setSelectedAnswerNote] = useState(null)

  // True if we should show the answer (happens after clicking an answer)
  const [showAnswer, setShowAnswer] = useState(false)

  // The index of the current answer being quizzed on in questionNotes
  const [correctAnswerNoteIndex, setCorrectAnswerNoteIndex] = useState(0)
  const [onLastAnswer, setOnLastAnswer] = useState(false)
  const [requestNextQuestion, setRequestNextQuestion] = useState(false)

  // If true, the question is latin and the answer is in english
  const [isQuestionLatin, setIsQuestionLatin] = useState(true)
  const questionField = isQuestionLatin ? 'latinField' : 'englishField'
  const answerField = isQuestionLatin ? 'englishField' : 'latinField'

  const isSmallScreen = window.innerWidth <= 576

  // returns true if the correct answer and selected answer are the same
  const isSelectedAnswerCorrect = () => selectedAnswerNote && correctAnswerNote && selectedAnswerNote.latinField === correctAnswerNote.latinField

  // the audio for the current latin word
  const [playAudio, { stop: stopAudio }] = useSound(correctAnswerNote ? correctAnswerNote.soundUrl : null)

  // When there are new filtered cards or someone clicks the next question button
  const handleNextQuestion = () => {
    console.log('handleNextQuestion', correctAnswerNoteIndex)
    console.log('questionNotes', questionNotes, correctAnswerNoteIndex)
    const correctAnswerNote = questionNotes[correctAnswerNoteIndex]
    const allFilteredNotesCopy = allFilteredNotes
      .map(note => note)
      .filter(note => correctAnswerNote && note.latinField !== correctAnswerNote.latinField)

    const randomNotes = [correctAnswerNote]

    while (randomNotes.length < 4) {
      const randomIndex = randomNotes.length === 0 ? correctAnswerNoteIndex : Math.floor(Math.random() * allFilteredNotesCopy.length)
      const randomNote = allFilteredNotesCopy[randomIndex]
      allFilteredNotesCopy.splice(randomIndex, 1)
      randomNotes.push(randomNote)
    }

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
    setPossibleAnswerNotes(randomNotes)

    // delay setting answer note because of use-sound race condition
    setTimeout(() => {
      setCorrectAnswerNote(correctAnswerNote)
      setShowAnswer(false)
      // set the next answer note to the next filtered card
      setCorrectAnswerNoteIndex(correctAnswerNoteIndex => (correctAnswerNoteIndex + 1) % questionNotes.length)
      if (correctAnswerNoteIndex === questionNotes.length - 1) {
        setOnLastAnswer(true)
      }
    }, 100)

    stopAudio()
  }

  // if the question notes change
  useEffect(() => {
    if (allFilteredNotes.length > 4 && requestNextQuestion) {
      handleNextQuestion()
    }
    if (requestNextQuestion) {
      setRequestNextQuestion(false)
    }
  }, [requestNextQuestion])

  // if the audio changes, play it
  useEffect(() => {
    if (correctAnswerNote && isQuestionLatin) {
      playAudio()
    }
  }, [playAudio])

  const startReview = () => {
    setCorrectAnswerNoteIndex(0)
    setIncorrectNotes([])
    setQuestionNotes(shuffle(incorrectNotes))
    setOnLastAnswer(false)
    setRequestNextQuestion(true)
  }

  const checkAnswer = note => {
    // we're already showing the answer, ignore this click
    if (showAnswer) {
      return
    }

    // show the answer
    setShowAnswer(true)

    // set which answer was selected
    setSelectedAnswerNote(note)

    // if the question is in english, play the latin answer's audio
    if (correctAnswerNote && !isQuestionLatin) {
      playAudio()
    }

    // Add incorrect answers to the state
    if (correctAnswerNote[questionField] !== note[questionField]) {
      setIncorrectNotes(incorrectNotes => [...incorrectNotes, correctAnswerNote])
    }

    // scroll to bottom
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100)
  }

  // Show the question. With play audio button and what question number we are on
  const questionJsx = correctAnswerNote && allFilteredNotes.length > 4 && (
    <h1 className="mt-3 mb-0 px-2 py-1 bg-secondary text-white">
      {(isQuestionLatin || showAnswer) && correctAnswerNote.soundUrl && <span style={{ cursor: 'pointer' }} onClick={playAudio}>▶️</span>}
      {' '}{correctAnswerNote[questionField]} ({correctAnswerNoteIndex !== 0 ? correctAnswerNoteIndex : questionNotes.length}/{questionNotes.length})
    </h1>
  )

  // Create the possible answers.
  const possibleAnswerNotesJsx = correctAnswerNote && allFilteredNotes.length > 4 && possibleAnswerNotes.map((note, i) => {
    // Style them based on if the question was correct
    let variant = ''
    if (showAnswer && correctAnswerNote[questionField] === note[questionField]) {
      variant = 'success'
    } else if (showAnswer && !isSelectedAnswerCorrect() && selectedAnswerNote[questionField] === note[questionField]) {
      variant = 'danger'
    }

    return (
      <ListGroup.Item key={i} action={!showAnswer} variant={variant} onClick={() => checkAnswer(note)}>
        {note[answerField]} {showAnswer && <strong>- {note[questionField]}</strong>}
      </ListGroup.Item>
    )
  })

  const reviewButtonJsx = incorrectNotes.length > 0 && (
    <Button className={`text-white ${isSmallScreen ? 'btn-block mb-2' : ''}`} variant="secondary" size="lg" onClick={startReview}>
      Review
    </Button>
  )

  const handleNextQuestionButton = () => {
    if (onLastAnswer) {
      setCorrectAnswerNoteIndex(0)
      setOnLastAnswer(false)
      setQuestionNotes(shuffle(allFilteredNotes))
    }

    setRequestNextQuestion(true)
  }

  const nextQuestionButtonJsx = (
    <Button className={`text-white ${isSmallScreen ? 'btn-block' : 'ml-2'}`} variant="primary" size="lg" onClick={handleNextQuestionButton}>
      Next Question
    </Button>
  )

  const addToReviewButtonJsx = (
    isSelectedAnswerCorrect() && <Button className={`text-white ${isSmallScreen ? 'btn-block mb-2' : 'ml-2'}`} variant="secondary" size="lg" onClick={() => {
      setIncorrectNotes(incorrectNotes => [...incorrectNotes, correctAnswerNote])
      handleNextQuestionButton()
    }}>
      Add to Reviews
    </Button>
  )

  const buttonsJsx = showAnswer && (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', flexDirection: isSmallScreen ? 'column' : 'row ' }}>
      <span>{reviewButtonJsx}</span> <span>{addToReviewButtonJsx} {nextQuestionButtonJsx}</span>
    </div>
  )

  const incorrectNotesJsx = incorrectNotes.length > 0 && (
    <Accordion className="mt-3">
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey="0" style={{
          color: '#721c24',
          backgroundColor: '#f5c6cb'
        }}>
          Review Vocab (Click to Show/Hide)
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
    <div className="row h-100">
      <div className={'col-sm-10 col-md-8 mx-auto my-auto bg-white px-3 py-3 rounded'}>
        <h3 className='text-primary'>Vocab Quiz</h3>
        <h4 className='text-secondary'>Question Language</h4>
        <ListGroup horizontal className='mb-2'>
          <ListGroup.Item
            action
            className={isQuestionLatin && 'text-white bg-primary'}
            onClick={() => setIsQuestionLatin(true)}>
            <strong>Latin</strong>
          </ListGroup.Item>
          <ListGroup.Item
            action
            className={!isQuestionLatin && 'text-white bg-primary'}
            onClick={() => setIsQuestionLatin(false)}>
            <strong>English</strong>
          </ListGroup.Item>
        </ListGroup>
        <FilterNotes action allNotes={allNotes} uniqueTags={uniqueTags} setAllFilteredNotes={(filteredNotes) => {
          setAllFilteredNotes(filteredNotes)
          setQuestionNotes(filteredNotes)
          // reset the correct answer index
          setCorrectAnswerNoteIndex(0)
          setOnLastAnswer(false)
          // call handle next question
          setRequestNextQuestion(true)
        }} />
        {questionJsx}
        <ListGroup className='mb-1'>
          {possibleAnswerNotesJsx}
        </ListGroup>

        {buttonsJsx}
        {incorrectNotesJsx}
      </div>
    </div>
  )
}

export default Game
