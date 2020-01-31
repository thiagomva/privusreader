import './SourceFollowButton.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import Dropdown from 'react-bootstrap/Dropdown'
import ManagerSourceFeedsContent from './ManagerSourceFeedsContent'


class SourceFollowButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isFollowing: false,
      show: false
    }
  }

  componentDidUpdate(prevProps) {
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

  onFollowToggle = (isOpen, e) => {
    if (isOpen && (!this.props.userSession || !this.props.userSession.isUserSignedIn())) {
      e.preventDefault()
      e.stopPropagation()
      this.props.signIn()
    }
    else {
      this.setState({show: isOpen})
    }
  }

  closeDropdown = () => {
    document.dispatchEvent(new MouseEvent('click'));
  }

  render() {
    return (
      <div>
        <Dropdown onToggle={this.onFollowToggle}>
          <Dropdown.Toggle className={"source-follow-button " + (this.state.isFollowing ? "alert-cancel-btn" : "action-btn")}>
            {this.state.isFollowing ?
              "Following" :
              "Follow"
            }
          </Dropdown.Toggle>
          <Dropdown.Menu alignRight={true}>
            <ManagerSourceFeedsContent closeDropdown={this.closeDropdown} {...this.props} />
          </Dropdown.Menu>
        </Dropdown>
      </div>)
  }
}
export default withRouter(SourceFollowButton)