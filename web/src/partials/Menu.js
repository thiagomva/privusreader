import './Menu.css'
import React, { Component } from 'react'
import { withRouter, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faBars, faStar, faEllipsisV, faArrowsAlt, faAngleRight, faAngleDown, faGlobeAmericas, faTimes, faItalic, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import TextInputModal from './TextInputModal'
import { confirm } from '../util/sweetalert'
import ManagerSourceFeedsContent from './ManagerSourceFeedsContent'
import Modal from 'react-bootstrap/Modal'
import { menuLimitForMobile } from '../util/constants'

class Menu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      feedState: {},
      feedSources: {},
      textModal: null,
      manageSource: null
    }
  }

  componentWillUnmount() {
    document.removeEventListener("click", () => {})
    document.removeEventListener("contextmenu", () => {})
  }

  componentDidMount() {
    this.setFeedSources()

    document.addEventListener("contextmenu", (event) =>
    {
      if (event.target && event.target.dataset && event.target.dataset.id && event.target.dataset.id.startsWith) {
        if (event.target.dataset.id.startsWith("feed.")) {
          this.handleFeedCtxMenu(event.target.dataset.id.substring(5), event)
        } else if (event.target.dataset.id.startsWith("source.")) {
          this.handleSourceCtxMenu(event.target.dataset.id.substring(7), event)
        }
      }
    }, false)
    document.addEventListener("click", (event) => {
      if (!event.target || ((!event.target.dataset || !event.target.dataset.menuhandle) &&
          (!event.target.parentNode || !event.target.parentNode.dataset || !event.target.parentNode.dataset.menuhandle))) {
        this.hideFeedMenu()
        this.hideSourceMenu()
      }
    }, false)
  }

  handleFeedCtxMenu(id, event) {
    this.hideSourceMenu()
    var category = this.props.categories[id]
    if (category) {
      event.preventDefault()
      var ctxMenu = document.getElementById("ctxFeedMenu")
      ctxMenu.setAttribute("data-data", JSON.stringify(category))
      this.showCtxMenu(ctxMenu, event, 60)
    }
  }

  handleSourceCtxMenu(feedId, event) {
    this.hideFeedMenu()
    var source = this.props.sources[feedId]
    if (source) {
      event.preventDefault()
      var ctxMenu = document.getElementById("ctxSourceMenu")
      ctxMenu.setAttribute("data-data", JSON.stringify(source))
      this.showCtxMenu(ctxMenu, event, 90)
    }
  }

  showCtxMenu(ctxMenu, event, height) {
    var x = event.pageX
    var y = event.pageY - (window.scrollY || 0)
    if (x >= 130) {
      x = x - 90
    } else {
      x = x - 10
    }
    if (y >= (window.innerHeight - 95)) {
      y = y - height + 10
    } else {
      y = y - 10
    }
    ctxMenu.style.display = "block"
    ctxMenu.style.left = x + "px"
    ctxMenu.style.top = y + "px"
  }

  hideFeedMenu() {
    var ctxSourceMenu = document.getElementById("ctxFeedMenu")
    if (ctxSourceMenu && ctxSourceMenu.style) ctxSourceMenu.style.display = "none"
  }

  hideSourceMenu() {
    var ctxSourceMenu = document.getElementById("ctxSourceMenu")
    if (ctxSourceMenu && ctxSourceMenu.style) ctxSourceMenu.style.display = "none"
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sources !== this.props.sources || prevProps.categories !== this.props.categories) {
      this.setFeedSources()
    }
  }

  setFeedSources() {
    var feedSources = {}
    for (var link in this.props.sources) {
      for (var i = 0; i < this.props.sources[link].categories.length; ++i) {
        if (!feedSources[this.props.sources[link].categories[i]]) {
          feedSources[this.props.sources[link].categories[i]] = []
        }
        feedSources[this.props.sources[link].categories[i]].push(this.props.sources[link])
      }
    }
    this.setState({feedSources: feedSources})
  }

  onToggleFeed(id) {
    if (this.state.feedState[id]) {
      delete this.state.feedState[id]
    } else {
      this.state.feedState[id] = true
    }
    this.setState({feedState: this.state.feedState})
  }

  onNewFeed = () => {
    this.setState({textModal: {title: "New Feed", text: "", categories: this.props.categories}})
  }

  onRenameFeed = () => {
    var element = document.getElementById("ctxFeedMenu")
    if (element && element.dataset && element.dataset.data) {
      var data = JSON.parse(element.dataset.data)
      this.setState({textModal: {title: "Rename Feed", text: data.name, id: data.id, categories: this.props.categories}}, () => element.style.display = "none")
    }
  }

  onRenameSource = () => {
    var element = document.getElementById("ctxSourceMenu")
    if (element && element.dataset && element.dataset.data) {
      var data = JSON.parse(element.dataset.data)
      this.setState({textModal: {title: "Rename Source", text: data.title, feedId: data.feedId}}, () => element.style.display = "none")
    }
  }

  onMoveSource = () => {
    var element = document.getElementById("ctxSourceMenu")
    if (element && element.dataset && element.dataset.data) {
      var data = JSON.parse(element.dataset.data)
      this.setState({manageSource: data})
    }
  }

  onDeleteFeed = () => {
    var element = document.getElementById("ctxFeedMenu")
    if (element && element.dataset && element.dataset.data) {
      var data = JSON.parse(element.dataset.data)
      element.style.display = "none"
      confirm("Are you sure about delete the feed '" + data.name + "'?", (result) =>
      {
        if (result) {
          this.props.deleteCategory(data.id)
        }
      })
    }
  }

  onUnfollowSource = () => {
    var element = document.getElementById("ctxSourceMenu")
    if (element && element.dataset && element.dataset.data) {
      var data = JSON.parse(element.dataset.data)
      element.style.display = "none"
      confirm("Are you sure about unfollow the source '" + data.title + "'?", (result) =>
      {
        if (result) {
          this.props.deleteSource(data.feedId)
        }
      })
    }
  }

  onCloseActionModal = (confirmed, inputValue) => {
    if (confirmed) {
      if (this.state.textModal.feedId) {
        this.props.renameSource(inputValue, this.state.textModal.feedId)
      } else {
        this.props.setCategory(inputValue, this.state.textModal.id)
      }
    }
    this.setState({textModal: null})
  }
 
  render() {
    return (
    <div className="rss-menu-container">
      <div className="rss-menu">
        <div className="rss-menu-logo">
          <NavLink className="clickable" to={`/explore`}>
            <img src="/logo.png" alt="Privus Reader" />
          </NavLink>
          {window.innerWidth <= menuLimitForMobile && 
          <FontAwesomeIcon className="mobile-close-menu" title="Close Menu" icon={faTimes} onClick={() => this.props.toggleMenu()} />}
        </div>
        <div className="rss-menu-nav">
          <div>
            <div>
              <FontAwesomeIcon icon={faGlobe} onClick={() => this.props.history.push('/explore')} title="Explore" />
              <NavLink exact to={`/explore`}>
                <div style={{color: "#ffffff"}}>Explore</div>
              </NavLink>
            </div>
          </div>
        </div>
        <div className="rss-menu-nav">
          <div>
            <div>
              <FontAwesomeIcon icon={faStar} onClick={() => this.props.history.push('/favorites')} title="Favorites" />
              <NavLink exact to={`/favorites`}>
                <div style={{color: "#ffffff"}}>Favorites</div>
              </NavLink>
            </div>
          </div>
        </div>
        <h5>FEEDS</h5>
        <div className="rss-menu-nav">
          <div>
            <div>
              <FontAwesomeIcon icon={faBars} onClick={() => this.props.history.push('/feed')} title="All" />
              <NavLink exact to={`/feed`}><div style={{color: "#ffffff"}}>All</div></NavLink>
            </div>
          </div>
        </div>
        {this.props.categories && Object.keys(this.props.categories).map((id) => (
          <div key={id} className="rss-menu-nav" style={(this.state.feedState[id] ? {} : {backgroundColor: "#ffffff"})}>
            <div>
              <div>
                <FontAwesomeIcon onClick={() => this.onToggleFeed(id)} icon={(this.state.feedState[id] ? faAngleRight : faAngleDown)} title={this.state.feedState[id] ? "Expand" : "Collapse"}  style={{color: (this.state.feedState[id] ? "#f7f7f7" : "#333333")}}/>
                <NavLink exact to={`/feed/${id}`} title={this.props.categories[id].name}>
                  <div data-id={"feed." + id}  style={{color: (this.state.feedState[id] ? "#ffffff" : "#333333")}}>{this.props.categories[id].name}</div>
                </NavLink>
              </div>
              <FontAwesomeIcon data-menuhandle="true" onClick={(e) => this.handleFeedCtxMenu(id, e)} className="rss-menu-settings" style={{color: (this.state.feedState[id] ? "#ffffff" : "#333333")}} title="Actions" icon={faEllipsisV}/>
            </div>
            {!this.state.feedState[id] && this.state.feedSources[id] && this.state.feedSources[id].map((source) => (
              <div key={source.feedId}>
                <div>
                  <FontAwesomeIcon className="source-no-img" icon={faGlobeAmericas} />
                  <NavLink exact to={`/feed/${encodeURIComponent(source.feedId)}`} title={source.title} style={{width: "calc(100% - 55px)"}}>
                    <div data-id={"source." + source.feedId}>{source.title}</div>
                  </NavLink>
                </div>
                <FontAwesomeIcon data-menuhandle="true" onClick={(e) => this.handleSourceCtxMenu(source.feedId, e)} className="rss-menu-settings" title="Actions" icon={faEllipsisV}/>
              </div>
            ))}
          </div>
        ))}
        <div className="rss-menu-new-feed">
          <button className="action-btn btn" onClick={this.onNewFeed}><FontAwesomeIcon icon={faPlus} />New Feed</button>
        </div>
      </div>
      <div className="rss-menu-footer">
        <div className="rss-menu-footer-legal">
          <NavLink exact to={`/terms`}>Terms</NavLink>
          <div></div>
          <NavLink exact to={`/privacy`}>Privacy</NavLink>
        </div>
        <span>Privus Reader</span>
      </div>

      {this.state.textModal &&
      <TextInputModal
        title={this.state.textModal.title} 
        inputValue={this.state.textModal.text} 
        categories={this.state.textModal.categories}
        onHide={this.onCloseActionModal}
      ></TextInputModal>}

      {this.state.manageSource &&
      <Modal centered={true} size="sm" show={true} onHide={() => this.setState({manageSource: null})}>
       <Modal.Header closeButton>
        Set source Feeds
       </Modal.Header>
       <Modal.Body>
        <ManagerSourceFeedsContent {...this.props}
          source={this.state.manageSource}
        ></ManagerSourceFeedsContent>
       </Modal.Body>
      </Modal>}
      
      <div id="ctxFeedMenu">
        <div onClick={() => this.onRenameFeed()}><FontAwesomeIcon icon={faItalic} />Rename</div>
        <div onClick={() => this.onDeleteFeed()}><FontAwesomeIcon icon={faTrashAlt} />Delete</div>
      </div>
      <div id="ctxSourceMenu">
        <div onClick={() => this.onRenameSource()}><FontAwesomeIcon icon={faItalic} />Rename</div>
        <div onClick={() => this.onMoveSource()}><FontAwesomeIcon icon={faArrowsAlt} />Move</div>
        <div onClick={() => this.onUnfollowSource()}><FontAwesomeIcon icon={faTrashAlt} />Unfollow</div>
      </div>
    </div>)
  }
}
export default withRouter(Menu)