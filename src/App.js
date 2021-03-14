import React, { Component, Fragment } from 'react'
import { Route } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import AuthenticatedRoute from './components/AuthenticatedRoute/AuthenticatedRoute'
import AutoDismissAlert from './components/AutoDismissAlert/AutoDismissAlert'
import Header from './components/Header/Header'
import SignUp from './components/SignUp/SignUp'
import SignIn from './components/SignIn/SignIn'
import SignOut from './components/SignOut/SignOut'
import ChangePassword from './components/ChangePassword/ChangePassword'
import Game from './components/Game/Game'

import deck from './data/llpsi.json'
const allTags = deck.notes.map(note => note.tags.map(tag => tag.toLowerCase())).flat()
const uniqueTags = [...new Set(allTags)].sort()

// https://stackoverflow.com/a/822486/3500171
const stripHtml = html => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// remove html from fields
deck.notes.forEach(note => {
  note.fields = note.fields.map(field => stripHtml(field))
  note.latinField = note.fields[0]
  note.englishField = note.fields[3]
  note.soundField = note.fields[6]
  if (note.soundField.length > 0) {
    const colonIndex = note.soundField.indexOf(':')
    const closingBracketIndex = note.soundField.indexOf(']')
    note.soundUrl = 'media/' + note.soundField.slice(colonIndex + 1, closingBracketIndex)
  } else {
    note.soundUrl = ''
  }
})

deck.notes = deck.notes.filter(note => note.latinField.trim().length > 0 && note.englishField.trim().length > 0)

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      msgAlerts: []
    }
  }

  setUser = user => this.setState({ user })

  clearUser = () => this.setState({ user: null })

  deleteAlert = (id) => {
    this.setState((state) => {
      return { msgAlerts: state.msgAlerts.filter(msg => msg.id !== id) }
    })
  }

  msgAlert = ({ heading, message, variant }) => {
    const id = uuid()
    this.setState((state) => {
      return { msgAlerts: [...state.msgAlerts, { heading, message, variant, id }] }
    })
  }

  render () {
    const { msgAlerts, user } = this.state

    return (
      <Fragment>
        <Header user={user} />
        {msgAlerts.map(msgAlert => (
          <AutoDismissAlert
            key={msgAlert.id}
            heading={msgAlert.heading}
            variant={msgAlert.variant}
            message={msgAlert.message}
            id={msgAlert.id}
            deleteAlert={this.deleteAlert}
          />
        ))}
        <main className="container">
          <Route path='/game' render={() => (
            <Game msgAlert={this.msgAlert} allNotes={deck.notes} uniqueTags={uniqueTags} />
          )} />
          <Route path='/sign-up' render={() => (
            <SignUp msgAlert={this.msgAlert} setUser={this.setUser} />
          )} />
          <Route path='/sign-in' render={() => (
            <SignIn msgAlert={this.msgAlert} setUser={this.setUser} />
          )} />
          <AuthenticatedRoute user={user} path='/sign-out' render={() => (
            <SignOut msgAlert={this.msgAlert} clearUser={this.clearUser} user={user} />
          )} />
          <AuthenticatedRoute user={user} path='/change-password' render={() => (
            <ChangePassword msgAlert={this.msgAlert} user={user} />
          )} />
        </main>
      </Fragment>
    )
  }
}

export default App
