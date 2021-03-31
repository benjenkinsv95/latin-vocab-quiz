import React from 'react'
// import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

// const authenticatedOptions = (
//   <Fragment>
//     <Nav.Link href="#change-password">Change Password</Nav.Link>
//     <Nav.Link href="#sign-out">Sign Out</Nav.Link>
//   </Fragment>
// )
//
// const unauthenticatedOptions = (
//   <Fragment>
//     {/*
//     <Nav.Link href="#sign-up">Sign Up</Nav.Link>
//     <Nav.Link href="#sign-in">Sign In</Nav.Link>
//     */}
//   </Fragment>
// )
//
// const alwaysOptions = (
//   <Fragment>
//     <Nav.Link href="#/">Home</Nav.Link>
//   </Fragment>
// )

const Header = ({ user }) => (
  <Navbar bg="primary" variant="dark" expand="md">
    <div className='container'>
      <div className='row w-100'>
        <div className="col-sm-10 col-md-8 mx-auto">
          <Navbar.Brand href="#" style={{ fontWeight: '700' }}>
            Latin Vocab Quiz
          </Navbar.Brand>
        </div>
      </div>
    </div>
  </Navbar>
)

export default Header
