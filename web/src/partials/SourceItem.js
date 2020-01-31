import "./SourceItem.css";
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faCheck } from "@fortawesome/free-solid-svg-icons";
import fromNow from 'fromnow'
import {FEED_MODE, LAYOUT_MODE} from "../pages/Feed";

class SourceItem extends Component {
  constructor(props){
    super(props)
    this.state = {
      isFavorite: false,
      isRead: false
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dataLoaded !== this.props.dataLoaded ||
      Object.keys(prevProps.favorites).length !== Object.keys(this.props.favorites).length ||
      Object.keys(prevProps.read).length !== Object.keys(this.props.read).length) {
      this.setFavoriteAndRead()
    }
  }

  componentDidMount() {
    this.setFavoriteAndRead()
  }

  setFavoriteAndRead = () => {
    this.setState({
      isFavorite: this.props.favorites && !!this.props.favorites[this.props.item.link],
      isRead: this.props.read && !!this.props.read[this.props.item.link]
    }) 
  }
  
  addToFavorites = (e) => {
    if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
      e.preventDefault()
      e.stopPropagation()
      this.props.signIn()
    }
    else {
      this.props.addToFavorites(this.props.item, this.props.item.sourceId)
    }
  }

  removeFromFavorites = (e) => {
    this.props.removeFromFavorites(this.props.item.link)
  }

  setRead = (e) => {
    if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
      e.preventDefault()
      e.stopPropagation()
      this.props.signIn()
    }
    else {
      this.props.setRead([this.props.item.link])
    }
  }

  setUnread = (e) => {
    this.props.setUnread([this.props.item.link])
  }

  showSource = () => {
    return this.props.mode !== FEED_MODE.SOURCE && this.props.item.source;
  }

  onTitleClick = (e) => {
    if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
      this.setRead(e)
    }
  }

  render() {
    const { item } = this.props;
    return (
        <div className={"source-card " + (this.props.layoutMode === LAYOUT_MODE.COMPACT ? "inline" :"" )}>
          {this.props.layoutMode === LAYOUT_MODE.EXPANDED && <div className="source-img" style={{backgroundImage: 'url('+item.image+')'}}></div>}
          <div className="source-details">
            {this.props.layoutMode === LAYOUT_MODE.COMPACT && this.showSource() &&
              <div className="source-info" href={item.source.link} target="_blank">{item.source.title}</div>
            }
            <a className="source-link" href={item.url ? item.url : item.link} onClick={this.onTitleClick} taget="_blank">
              <div className={"source-title" + (this.state.isRead ? " read-title" : "")}>{item.title}</div>
              <div className="source-content">{item.contentSnippet}</div>
            </a>
            <div className="source-time-actions">
              {this.props.layoutMode !== LAYOUT_MODE.COMPACT && this.showSource() &&
                <div className="source-info" href={item.source.link} target="_blank">{item.source.title}</div>
              }
              {this.props.layoutMode !== LAYOUT_MODE.COMPACT && this.showSource() &&
                <div className="separator">&nbsp;/&nbsp;</div>
              }
              <div className="source-time">{fromNow(item.pubDate, { max: 1})}</div>
              <div className="source-actions ml-auto">
                  {this.state.isFavorite ?
                    <FontAwesomeIcon title="Remove from favorites" className="favorited" icon={faStar} onClick={this.removeFromFavorites}/> :
                    <FontAwesomeIcon title="Add to favorites" icon={faStar} onClick={this.addToFavorites}/>
                  }
                  {this.state.isRead ?
                    <FontAwesomeIcon title="Set unread" className="read" icon={faCheck} onClick={this.setUnread}/> :
                    <FontAwesomeIcon title="Mark as read" icon={faCheck} onClick={this.setRead}/>
                  }
              </div>
            </div>
          </div>
        </div>
      )   
  }
}
export default withRouter(SourceItem)
