import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SourceItemList from '../partials/SourceItemList';
import { faThList, faBars, faCheckDouble, faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import TextInputModal from '../partials/TextInputModal'
import { FEED_MODE } from './Feed';

export const LAYOUT_MODE = {
  COMPACT: 0,
  EXPANDED: 1
}

class Favorites extends Component {
  constructor(props){
    super(props)
    this.state = this.getStateObject(props)
  }

  getStateObject(props){
      return {
        items:null,
        isLoading: true,
        layoutMode: (this.state && this.state.layoutMode != null) ? this.state.layoutMode : LAYOUT_MODE.COMPACT,
        showOnlyUnread: (this.state && this.state.showOnlyUnread != null) ? this.state.showOnlyUnread : true,        
      }
  }

  componentWillMount() {
    if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
		  this.props.history.push('/')
		}
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.dataLoaded !== this.props.dataLoaded) {
        this.setState(this.getStateObject(this.props), () => this.loadItems())
    }
  }

  componentDidMount(){
    this.loadItems();
  }

  loadItems = () => {
    if (this.props.favorites) {
      this.setState({items: this.getFavoritesItems(), isLoading:false})
    }
  }

  getFavoritesItems = () => {
    return Object.values(this.props.favorites).map(item => item.data)
  }

  toggleLayoutMode = () => {
    this.setState({layoutMode: ((this.state.layoutMode + 1) % 2)})
  }
  
  onMarkAllAsReadClick = () => {
    this.props.setRead(this.state.items.map(item => item.link))
  }

  toggleOnlyUnead = () => {
    this.setState({showOnlyUnread: !this.state.showOnlyUnread})
  }

  render() {
    return (
      <div>
        {this.state.isLoading ? 
          <div className="loading-div">Loading...</div> :
          this.state.error ? <div className="loading-div">Error loading feed</div> :
          <div className={this.state.layoutMode === LAYOUT_MODE.COMPACT ? "compact-layout" : "expanded-layout"}>
            <div className="feed-header">
              <div className="feed-title-actions">
                <div className="feed-title">
                  Favorites
                </div>
                <div className="feed-actions">
                  <FontAwesomeIcon title="Mark all as read" className="icon-action" icon={faCheckDouble} onClick={this.onMarkAllAsReadClick}/>
                  <div className="icon-action" title="Show only unread" onClick={this.toggleOnlyUnead}>
                    <FontAwesomeIcon className="mr-1" icon={this.state.showOnlyUnread ? faCheckSquare : faSquare}/>
                    <span>Only unread</span>
                  </div>
                </div>
              </div>
            </div>
            <SourceItemList {...this.props} mode={FEED_MODE.FAVORITES} toggleOnlyUnead={this.toggleOnlyUnead} items={this.state.items} layoutMode={this.state.layoutMode} showOnlyUnread={this.state.showOnlyUnread}></SourceItemList>
            {this.state.textModal &&
            <TextInputModal
              title={this.state.textModal.title} 
              inputValue={this.state.textModal.text} 
              onHide={this.onCloseActionModal}
            ></TextInputModal>}
          </div>
        }
      </div>)
  }
}
export default withRouter(Favorites)