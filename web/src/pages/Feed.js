import './Feed.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import ServerManager from '../util/serverManager'
import SourceItemList from '../partials/SourceItemList'
import SourceFollowButton from '../partials/SourceFollowButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThList, faBars, faItalic, faCheckDouble, faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import TextInputModal from '../partials/TextInputModal'

export const FEED_MODE = {
  ALL: 0,
  CATEGORY: 1,
  SOURCE: 2,
  FAVORITES: 3
}

export const LAYOUT_MODE = {
  COMPACT: 0,
  EXPANDED: 1
}

class Feed extends Component {
  constructor(props){
    super(props)
    this.state = this.getStateObject(props)
  }

  getStateObject(props){
      return {
        categoryOrSourceId: props.match.params.categoryOrSourceId ? decodeURIComponent(props.match.params.categoryOrSourceId) : null,
        source: null,
        isSubscribed: false,
        isLoading: true, 
        items:null,
        textModal: null,
        showOnlyUnread: (this.state && this.state.showOnlyUnread != null) ? this.state.showOnlyUnread : true,
        layoutMode: (this.state && this.state.layoutMode != null) ? this.state.layoutMode : LAYOUT_MODE.COMPACT,
        error: false
      }
  }
  
  componentWillMount() {
    if ((!this.props.userSession || !this.props.userSession.isUserSignedIn()) && window.location.pathname === "/feed") {
		  this.props.history.push('/explore')
		}
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.dataLoaded && !prevProps.dataLoaded || 
      (prevProps.match.params.categoryOrSourceId !== this.props.match.params.categoryOrSourceId)) {
        this.setState(this.getStateObject(this.props), () => this.loadSources())
    }
  }

  componentDidMount(){
    if (this.props.dataLoaded) {
      this.loadSources();
    }
  }

  loadSources = () => {
    var sourcesIdList = []
    var feedMode = FEED_MODE.ALL
    if (!this.state.categoryOrSourceId) {
      for (let source in this.props.sources) {
        sourcesIdList.push(source)
      }
    }
    else if (this.props.categories && this.props.categories[this.state.categoryOrSourceId] && this.props.sources) {
      for (let source in this.props.sources) {
        if (this.props.sources[source].categories.includes(this.state.categoryOrSourceId)) {
          sourcesIdList.push(source)
        }
      }
      feedMode = FEED_MODE.CATEGORY
    }
    else {
      if (this.isValidUrl(this.state.categoryOrSourceId)) {
        sourcesIdList.push(this.state.categoryOrSourceId)
        feedMode = FEED_MODE.SOURCE
      }
      else {
        this.props.history.push('/feed')
      }
    }
    this.setState({feedMode: feedMode})
    this.loadItems(sourcesIdList)
  }

  isValidUrl = (url) => {
    return url && url.startsWith &&
      (url.startsWith('feed/http://') || 
      url.startsWith('feed/https://') || 
      url.startsWith('http://') || 
      url.startsWith('https://'))
  }

  loadItems = (sourcesIdList) => {
    var loadPromises = []
    for (let i = 0; i < sourcesIdList.length; i++) {
      loadPromises.push(ServerManager.parseRss(sourcesIdList[i]))
    }
    Promise.all(loadPromises.map(p => p.catch(e => e))).then((results) =>
    {
      let source = null
      if (results && results.length == 1 && !(results[0] instanceof Error)) {
        source = results[0]
      }
      this.setState({items: this.getItemsListFromSources(sourcesIdList, results), source: source})
    }).finally(() => this.setState({isLoading: false}))
  }

  getItemsListFromSources = (sourcesIdList, sources) => {
    let items = []
    for (let i = 0; i < sources.length; i++) {
      if (!(sources[i] instanceof Error)) {
        let source = sources[i]
        let sourceClone = JSON.parse(JSON.stringify(source))
        delete sourceClone.items
        source.items = source.items.map(item => ({...item, sourceId: sourcesIdList[i], source: sourceClone}))
        items = items.concat(source.items) 
      }
    }
    return items
  }

  toggleLayoutMode = () => {
    this.setState({layoutMode: ((this.state.layoutMode + 1) % 2)})
  }

  onRenameClick = (text) => {
    this.setState({
      textModal: {
        title: this.state.feedMode === FEED_MODE.SOURCE ? "Rename Source" : "Rename Feed",
        text: text,
        categories: this.state.feedMode !== FEED_MODE.SOURCE ? this.props.categories : null
      }
    })
  }

  onCloseActionModal = (confirmed, inputValue) => {
    if (confirmed) {
      if (this.state.feedMode === FEED_MODE.SOURCE) {
        this.props.renameSource(inputValue, this.state.categoryOrSourceId)
      } else {
        this.props.setCategory(inputValue, this.state.categoryOrSourceId)
      }
    }
    this.setState({textModal: null})
  }

  onMarkAllAsReadClick = () => {
    this.props.setRead(this.state.items.map(item => item.link))
  }

  toggleOnlyUnead = () => {
    this.setState({showOnlyUnread: !this.state.showOnlyUnread})
  }

  render() {
    let source, sourceTitle
    let isFollowing = false
    if (this.state.feedMode === FEED_MODE.SOURCE && this.state.source) {
      source = this.state.source
      source.feedId = this.state.categoryOrSourceId
      if (!source.feedId.startsWith('feed/')) {
        source.feedId = 'feed/'+source.feedId
      }
      if (this.props.sources[source.feedId]) {
        isFollowing = true
        sourceTitle = this.props.sources[source.feedId].title
      }
    }
    let title = "All Personal Feeds"
    if (this.state.feedMode === FEED_MODE.CATEGORY && this.props.categories && this.props.categories[this.state.categoryOrSourceId]) {
      title = this.props.categories[this.state.categoryOrSourceId].name
    }
    else if (this.state.feedMode === FEED_MODE.SOURCE && source) {
      title = (sourceTitle ? sourceTitle : source.title)
    }
    return (
      <div>
        {this.state.isLoading ? 
          <div className="loading-div">Loading...</div> :
          this.state.error ? <div className="loading-div">Error loading feed</div> :
          <div className={this.state.layoutMode === LAYOUT_MODE.COMPACT ? "compact-layout" : "expanded-layout"}>
            <div className="feed-header">
              <div className="feed-title-actions">
                {source && 
                  <a className="feed-title" href={source.link} target="_blank" rel="noopener noreferrer">
                    {title}
                  </a>
                }
                {!source &&
                  <div className="feed-title">
                    {title}
                  </div>
                }
                
                <div className="feed-actions">
                {this.state.feedMode === FEED_MODE.SOURCE && source &&
                  <SourceFollowButton source={source} {...this.props}></SourceFollowButton>
                }
                {((this.state.feedMode === FEED_MODE.SOURCE && isFollowing) ||
                  (this.state.feedMode === FEED_MODE.CATEGORY)) && 
                  <FontAwesomeIcon title="Rename" className="icon-action" icon={faItalic} onClick={e => this.onRenameClick(title)}/>
                }
                {this.props.userSession && this.props.userSession.isUserSignedIn() &&
                  <FontAwesomeIcon title="Mark all as read" className="icon-action" icon={faCheckDouble} onClick={this.onMarkAllAsReadClick}/>
                }
                {this.props.userSession && this.props.userSession.isUserSignedIn() &&
                <div className="icon-action" title="Show only unread" onClick={this.toggleOnlyUnead}>
                  <FontAwesomeIcon className="mr-1" icon={this.state.showOnlyUnread ? faCheckSquare : faSquare}/>
                  <span>Only unread</span>
                </div>
                }
                </div>
              </div>
              {this.state.feedMode === FEED_MODE.SOURCE && source &&
                <div className="feed-description">{source.description}</div>
              }
            </div>
            <SourceItemList {...this.props} toggleOnlyUnead={this.toggleOnlyUnead} mode={this.state.feedMode} items={this.state.items} layoutMode={this.state.layoutMode} showOnlyUnread={this.state.showOnlyUnread}></SourceItemList>
            {this.state.textModal &&
            <TextInputModal
              title={this.state.textModal.title} 
              inputValue={this.state.textModal.text} 
              categories={this.state.textModal.categories}
              onHide={this.onCloseActionModal}
            ></TextInputModal>}
          </div>
        }
      </div>)
  }
}
export default withRouter(Feed)