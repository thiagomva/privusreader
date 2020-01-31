import './SourceItemList.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import SourceItem from '../partials/SourceItem'
import { FEED_MODE } from '../pages/Feed'

class SourceItemList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: null
    }
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.dataLoaded && (prevProps.showOnlyUnread != this.props.showOnlyUnread ||
      Object.keys(prevProps.read).length != Object.keys(this.props.read).length)
      ) {
        this.filterAndSortItems(this.props)
    }
  }
  
  componentDidMount = () => {
    this.filterAndSortItems(this.props)
  }

  filterAndSortItems = (props) => {
    var visibleItems = props.items
    if (props.showOnlyUnread) {
      visibleItems = []
      for (let i = 0; i < props.items.length; i++) {
        const item = props.items[i];
        if (!props.read[item.link]) {
          visibleItems.push(item)
        }
      }
    }
    visibleItems.sort((a, b) => {
      if (!a.pubDate) {
        return 1
      }
      else if (!b.pubDate) {
        return -1
      }
      return new Date(a.pubDate) > new Date(b.pubDate) ? -1 : 1
    })
    this.setState({items: visibleItems})
  }

  getEmptyMessage() {
    if (this.props.items && this.props.items.length === 0 ) {
      if (this.props.mode === FEED_MODE.SOURCE) {
        return "There are no articles in this source."
      }
      else if (this.props.mode === FEED_MODE.FAVORITES) {
        return "There are no articles in your favorites."
      }
      return "There are no articles in your feed."
    }
    else {
      return "You are updated!"
    }
  }

  getEmptySubMessage() {
    if (this.props.items && this.props.items.length === 0 ) {
      if (this.props.mode === FEED_MODE.SOURCE) {
        return "Find other sources from your interest."
      }
      else if (this.props.mode === FEED_MODE.FAVORITES) {
        return "Click on the star to save your favorites articles."
      }
      return "Follow sources from your interest and stay updated."
    }
    else {
      return "You read all articles of this feed."
    }
  }

  onEmptyFeedButtonClick = () => {
    if (this.props.items && this.props.items.length > 0 ) {
      this.props.toggleOnlyUnead()
    } else {
      this.props.history.push("/explore")
    }
  }

  getActionButtonText = () => {
    if (this.props.items && this.props.items.length > 0 ) {
      return "SEE ALL ARTICLES"
    }
    else {
      return "FIND SOURCES"
    }
  }

  render() {
    return (
      <div>
        {this.state.items && this.state.items.map(item => 
          <SourceItem {...this.props} key={item.link} item={item}></SourceItem>
        )}
        {this.state.items && this.state.items.length === 0 &&
          <div className="empty-feed">
              <div className="empty-message">{this.getEmptyMessage()}</div>
              <div className="empty-submessage">{this.getEmptySubMessage()}</div>
              <div className="btn action-btn mt-4" onClick={this.onEmptyFeedButtonClick}>{this.getActionButtonText()}</div>
          </div>
        }
      </div>)
  }
}
export default withRouter(SourceItemList)