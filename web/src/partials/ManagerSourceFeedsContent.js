import './ManagerSourceFeedsContent.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class ManagerSourceFeedsContent extends Component {
  constructor(props){
    super(props)
    this.state = {
      isCreatingCategory: false,
      inputValue: "",
      error: ""
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.dataLoaded !== this.props.dataLoaded ||
      Object.keys(prevProps.sources).length !== Object.keys(this.props.sources).length) {
      this.setIsFollowing()
    }
  }

  componentDidMount = () => {
    this.setIsFollowing()
  }

  setIsFollowing = () => {
    this.setState({ isFollowing: this.props.sources && !!this.props.sources[this.props.source.feedId] })
  }

  onNewFeedClick = (e) => {
    this.setState({isCreatingCategory: true}, () => {setTimeout(() => { this.textInput && this.textInput.select() }, 100)})
  }

  onCreateClick = (e) => {
    e.preventDefault()
    if (!this.state.inputValue || this.state.error) {
      return
    }
    for (var categoryKey in this.props.categories) {
      if(this.props.categories[categoryKey].name.toLowerCase() === this.state.inputValue.toLowerCase()) {
        this.setState({error: "Already exists a feed with the selected name"})
        return
      }
    }
    var self = this;
    this.props.setCategory(this.state.inputValue).then(id => {
      self.setSourceCategories(id)
    })
  }

  setSource = (categoryId) => {
    this.props.setSource(this.props.source.title, this.props.source.feedId, [categoryId],  this.props.source.iconUrl ? this.props.source.iconUrl : this.props.source.visualUrl).then(() => this.onActionFinished())
  }

  onActionFinished = () => {
    this.setState({isCreatingCategory:false})
    if (this.props.closeDropdown) {
      this.props.closeDropdown()
    }
  }

  onCancelClick = (e) => {
    this.setState({isCreatingCategory: false, inputValue: ""})
  }

  isCategoryIncludedOnSource = (categoryKey) => {
    return this.props.sources && this.props.sources[this.props.source.feedId] && this.props.sources[this.props.source.feedId].categories.includes(categoryKey)
  }

  setSourceCategories = (categoryKey) => {
    if (!this.state.isFollowing) {
      this.setSource(categoryKey)
    }
    else if (!this.isCategoryIncludedOnSource(categoryKey)) {
      this.props.setSourceCategories(this.props.source.feedId, [categoryKey]).then(() => this.onActionFinished())
    }
    else {
      this.props.removeCategoryFromSource(this.props.source.feedId, categoryKey).then(() => this.onActionFinished())
    }
  }

  render() {
    return (
        <div className="feed-selection">
          <form onSubmit={this.onCreateClick}>
            {this.state.isCreatingCategory && 
            <div className="mx-2">
                <div className="new-feed-label">Feed name</div>
                <div className="name-input-wrapper mt-1 mb-2">
                  <input type="text" 
                    ref={(input) => this.textInput = input} 
                    value={this.state.inputValue} 
                    onChange={e => this.setState({error: "", inputValue: e.target.value })}
                    placeholder="e.g. Tech"
                  />
                  {this.state.error && <span>{this.state.error}</span>}
                </div>
            </div>
            }
            {!this.state.isCreatingCategory && 
              <div>
                {(!this.props.categories || Object.keys(this.props.categories).length === 0) &&
                  <div className="mx-2">Create new feed and include the sources you want to follow</div>
                }
                {this.props.categories && Object.keys(this.props.categories).map(categoryKey => 
                    <div onClick={e => this.setSourceCategories(categoryKey)} className={"feed-item" + (this.isCategoryIncludedOnSource(categoryKey) ? " category-active": "")} key={categoryKey}>
                      {this.isCategoryIncludedOnSource(categoryKey) ?
                       <FontAwesomeIcon className="mr-2" icon={faCheck} /> :
                       <FontAwesomeIcon className="mr-2" icon={faPlus} />
                      }
                      {this.props.categories[categoryKey].name}
                    </div>
                )}
              </div>
            }
            {this.state.isCreatingCategory && 
            <button type="submit" className="btn action-btn ml-2 mt-2 mr-2 float-right" disabled={!this.state.inputValue || this.state.error} onClick={this.onCreateClick}>Create</button>
            }
            {this.state.isCreatingCategory && 
            <button type="button" className="btn alert-cancel-btn mt-2 float-right" onClick={this.onCancelClick}>Cancel</button>
            }
            {!this.state.isCreatingCategory && 
            <button type="button" className="btn action-btn float-right mt-2 mr-2" onClick={this.onNewFeedClick}><FontAwesomeIcon icon={faPlus} />&nbsp;New Feed</button>
            }
          </form>              
        </div>)
  }
}
export default withRouter(ManagerSourceFeedsContent)