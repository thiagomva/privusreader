import './NavBar.css'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import BlockstackManager from '../util/blockstackManager'
import { server_error } from '../util/sweetalert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faSearch, faAlignJustify } from '@fortawesome/free-solid-svg-icons'
import { menuLimitForMobile } from '../util/constants'
import SearchSources from './SearchSources'

class NavBar extends Component {
  constructor(props){
    super(props)
		this.state = {
      person: null
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.userSession && this.props.userSession.isUserSignedIn() && this.state.person === null) {
		  this.componentDidMount()
		}
  }
  
  componentDidMount() {
    if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
      BlockstackManager.getUserProfile(this.props.userSession.loadUserData().username).then((person) => 
      {
        this.setState({ person: person })
      }).catch((err) => server_error(err))
    }
  }

  render() {
    var username = null
    var userImage = null
    if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
      username = this.state.person && this.state.person.name ? this.state.person.name : this.props.userSession.loadUserData().username
      userImage = this.state.person && this.state.person.avatarUrl
    }
    return (
      <nav className="navbar navbar-expand navbar-light"> 
        <div className={(username && window.location.pathname !== "/" ? "nav-container" : "container")}>
          {(window.location.pathname !== "/" && (!username || window.innerWidth <= menuLimitForMobile)) &&
          <div className="nav-logo">
            <NavLink to={(username ? `/explore` : `/`)}><img src="/logo2.png" alt="Privus Reader" /></NavLink>
            {window.innerWidth <= menuLimitForMobile && username &&
            <FontAwesomeIcon title="Show Menu" icon={faAlignJustify} onClick={() => this.props.toggleMenu()} />}
          </div>}

          {window.location.pathname !== "/explore" && window.location.pathname !== "/" && window.innerWidth > menuLimitForMobile &&  
          <div className="nav-search"><SearchSources></SearchSources></div>}
          
          <div className="ml-auto">
            <ul className="navbar-nav">
              {username &&
                <li className="nav-item dropdown">                  
                  <a className="dropdown-toggle nav-link clickable" target="_self" id="navbarProfile" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <div className="user-nav-container">
                      <div className="user-nav-wrap">
                        {userImage ? <img src={userImage} className="user-img-nav" alt={username} /> : <FontAwesomeIcon icon={faUserCircle} /> }
                        {window.innerWidth > menuLimitForMobile && <span>{username}</span>}
                      </div>
                    </div>
                  </a>
                  <div className="dropdown-menu signout" aria-labelledby="navbarProfile">
                    <a className="dropdown-item clickable" target="_self" onClick={() => this.props.signOut()}>SIGN OUT</a>
                  </div>
                </li>
              }
              {!username && 
                <li className="nav-item mx-lg-2">
                  <div className="nav-link link-nav underline clickable" onClick={() => this.props.signIn()}>SIGN IN</div>
                </li>
              }
            </ul>
          </div>
        </div>
      </nav>)   
  }
}
export default withRouter(NavBar)
