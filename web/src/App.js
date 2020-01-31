import './App.css'
import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { UserSession, isExpirationDateValid } from 'blockstack'
import NavBar from './partials/NavBar'
import { appConfig, menuLimitForMobile } from './util/constants'
import { withRouter } from 'react-router-dom'
import { server_error } from './util/sweetalert'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Home from './pages/Home'
import SignIn from './partials/SignIn'
import BlockstackManager from './util/blockstackManager'
import SearchResults from './pages/SearchResults'
import Feed from './pages/Feed'
import Menu from './partials/Menu'
import Favorites from './pages/Favorites'
import TopicList from './pages/TopicList'
import LandingPage from './pages/LandingPage'


class App extends Component {
  constructor() {
    super()
    this.userSession = new UserSession({ appConfig })
    this.state = {
      showSignIn: false,
      showMenu: true,
      categories: {},
      sources: {},
      read: {},
      favorites: {},
      dataLoaded: !this.userSession.isUserSignedIn()
    }
    
  }

  componentWillMount() {
    if (!this.userSession.isUserSignedIn() && this.userSession.isSignInPending()) {
      var href = window.location.pathname
      this.userSession.handlePendingSignIn()
      .then((userData) => {
        if(!userData.username) {
          throw new Error('This app requires a username.')
        }
        this.componentDidMount()
        this.props.history.push(!!href && href !== "/" ? href : '/explore')
      }).catch((err) => server_error(err))
    } else if (this.userSession.isUserSignedIn() && !isExpirationDateValid(this.userSession.loadUserData().authResponseToken)) {
      this.signOut()
    }
  }

  componentDidMount() {
    if (this.userSession.isUserSignedIn()) {
      var promises = []
      promises.push(BlockstackManager.listCategories())
      promises.push(BlockstackManager.listSources())
      promises.push(BlockstackManager.listRead())
      promises.push(BlockstackManager.listFavorites())
      Promise.all(promises).then(result => {
        this.setState({categories: result[0], sources: result[1], read: result[2], favorites: result[3], dataLoaded: true})
      }).catch((err) => server_error(err))
    }
    this.setState({showMenu: (window.innerWidth > menuLimitForMobile)})
  }

  toggleMenu = () => {
    this.setState({showMenu: !this.state.showMenu})
  }

  setSource = (name, feedId, categoryIds, iconUrl = null) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.setSource(name, feedId, categoryIds, self.state.sources, iconUrl)
      .then((sources) => self.setState({sources: sources}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  renameSource = (name, feedId) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.renameSource(name, feedId, self.state.sources)
      .then((sources) => self.setState({sources: sources}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  deleteSource = (feedId) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.deleteSource(feedId, self.state.sources)
      .then((sources) => self.setState({sources: sources}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  setSourceCategories = (feedId, categoryIds) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.setSourceCategories(feedId, categoryIds, self.state.sources)
      .then((sources) => self.setState({sources: sources}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  removeCategoryFromSource = (feedId, categoryIds) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.removeCategoryFromSource(feedId, categoryIds, self.state.sources)
      .then((sources) => self.setState({sources: sources}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  addToFavorites = (itemData, sourceUrl) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.setFavorite(itemData, sourceUrl, self.state.favorites)
      .then((favorites) => self.setState({favorites: favorites}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  removeFromFavorites = (itemLink) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.removeFavorite(itemLink, self.state.favorites)
      .then((favorites) => self.setState({favorites: favorites}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  setCategory = (name, id = null) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.setCategory(name, self.state.categories, id)
      .then((result) => self.setState({categories: result.categories}, () => resolve(result.id)))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  deleteCategory = (id) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.deleteCategory(id, self.state.categories, self.state.sources)
      .then((response) => self.setState({categories: response[0], sources: response[1]}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  setRead = (links) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.setRead(links, self.state.read)
      .then((read) => self.setState({read: read}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  setUnread = (links) => {
    var self = this
    return new Promise(function (resolve, reject) {
      BlockstackManager.setUnread(links, self.state.read)
      .then((read) => self.setState({read: read}, () => resolve()))
      .catch((err) => 
      {
        server_error(err)
        reject(err)
      })
    })
  }

  signIn(href) {
    var origin = window.location.origin
    var redirect = !!href ? href : origin
    redirect = redirect.replace("#","/")
    setTimeout(() => this.userSession.redirectToSignIn(redirect, origin + '/manifest.json', ['store_write']), 0)
  }

  signOut() {
    this.userSession.signUserOut(window.location.origin)
  }

  showSignInModal(message) {
    if(!message){
      message = "Log in to get started."
    }
    this.setState({showSignIn: true, signMessage: message})
  }

  onCloseSignIn(redirect) {
    this.setState({ showSignIn: false })
    if (redirect) {
      this.signIn(window.location.href)
    }
  }

  clone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
  }

  render() {
    var loggedUser = this.userSession && this.userSession.isUserSignedIn()
    return (
      <main role="main">
        {this.state.showSignIn && 
        <SignIn 
          userSession={this.userSession} 
          message={this.state.signMessage}
          onHide={(redirect) => this.onCloseSignIn(redirect)}
        />}
        {loggedUser && this.state.showMenu && (window.location.pathname !== "/" || window.innerWidth <= menuLimitForMobile) &&
        <Menu
          toggleMenu={this.toggleMenu}
          categories={this.clone(this.state.categories)}
          sources={this.clone(this.state.sources)}
          setCategory={this.setCategory}
          deleteCategory={this.deleteCategory}
          renameSource={this.renameSource}
          deleteSource={this.deleteSource}
          setSource={this.setSource}
          setSourceCategories={this.setSourceCategories}
          removeCategoryFromSource={this.removeCategoryFromSource}
        />
        }
        <div className={(loggedUser && window.innerWidth > menuLimitForMobile && window.location.pathname !== "/" ? "app-content" : "")}>
          <NavBar 
            userSession={this.userSession} 
            signOut={() => this.signOut()} 
            signIn={(message) => this.showSignInModal(message)}
            toggleMenu={this.toggleMenu}
          />
          <div className={(!loggedUser && window.location.pathname !== "/" ? "container" : "")}>
            <Switch>
              <Route 
                path={`/privacy`} 
                render={ routeProps => <Privacy {...routeProps} /> }
              />
              <Route 
                path={`/terms`} 
                render={ routeProps => <Terms {...routeProps} /> }
              />
              <Route 
                path={`/search/:searchQuery`} 
                render={ routeProps => <SearchResults {...routeProps} 
                  categories={this.clone(this.state.categories)}
                  sources={this.clone(this.state.sources)}
                  setCategory={this.setCategory}
                  setSource={this.setSource}
                  setSourceCategories={this.setSourceCategories}
                  removeCategoryFromSource={this.removeCategoryFromSource}
                  userSession={this.userSession}
                  signIn={(message) => this.showSignInModal(message)}
                  /> }
              />
              <Route 
                path={`/topic/:topicName`} 
                render={ routeProps => <TopicList {...routeProps} 
                  categories={this.clone(this.state.categories)}
                  sources={this.clone(this.state.sources)}
                  setCategory={this.setCategory}
                  setSource={this.setSource}
                  setSourceCategories={this.setSourceCategories}
                  removeCategoryFromSource={this.removeCategoryFromSource}
                  userSession={this.userSession}
                  signIn={(message) => this.showSignInModal(message)}
                  /> }
              />
              <Route 
                path={`/favorites`} 
                render={ routeProps => <Favorites {...routeProps} 
                  userSession={this.userSession}
                  signIn={(message) => this.showSignInModal(message)}
                  favorites={this.clone(this.state.favorites)}
                  read={this.clone(this.state.read)}
                  addToFavorites={this.addToFavorites}
                  removeFromFavorites={this.removeFromFavorites}
                  setRead={this.setRead}
                  setUnread={this.setUnread}
                  dataLoaded={this.state.dataLoaded}
                  /> }
              />
              <Route 
                path={`/explore`} 
                render={ routeProps => <Home {...routeProps} 
                  userSession={this.userSession}
                  signIn={(message) => this.showSignInModal(message)} 
                  /> }
              />
              <Route 
                path={`/feed/:categoryOrSourceId?`} 
                render={ routeProps => <Feed {...routeProps} 
                  userSession={this.userSession}
                  signIn={(message) => this.showSignInModal(message)}
                  favorites={this.clone(this.state.favorites)}
                  categories={this.clone(this.state.categories)}
                  sources={this.clone(this.state.sources)}
                  read={this.clone(this.state.read)}
                  addToFavorites={this.addToFavorites}
                  removeFromFavorites={this.removeFromFavorites}
                  renameSource={this.renameSource}
                  setCategory={this.setCategory}
                  setSource={this.setSource}
                  setSourceCategories={this.setSourceCategories}
                  removeCategoryFromSource={this.removeCategoryFromSource}
                  setRead={this.setRead}
                  setUnread={this.setUnread}
                  dataLoaded={this.state.dataLoaded}
                  /> }
              />
              <Route 
                path={`/`} 
                render={ routeProps => <LandingPage {...routeProps} 
                  userSession={this.userSession}
                  signIn={(message) => this.showSignInModal(message)} 
                  /> }
              />
            </Switch>
          </div>
        </div>

      </main>
    );
  }
}
export default withRouter(App)
