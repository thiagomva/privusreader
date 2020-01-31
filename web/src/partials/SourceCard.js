import './SourceCard.css'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import SourceFollowButton from './SourceFollowButton';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class SourceCard extends Component {
  render() {
    const {feedId, title, visualUrl, website, description} = this.props.source;

    return (
      <div className="source-card-div">
        <div className="source-card-column-img">
          <img className="source-card-img" onError={e => e.target.src='/rss.png'} src='/rss.png' alt="Source Icon"></img>
        </div>
        <div className="source-card-column-details">
          <div className="title-website-follow">
            <div className="title-website">
              <NavLink
                key={'link'+feedId}
                to={`/feed/${encodeURIComponent(feedId)}`}
                className="source-card-title">
                {title}
              </NavLink>
              <a className="source-card-website mt-1 mb-3" href={website} target="_blank" rel="noopener noreferrer">{website}</a>
              <div className="source-card-description">{description}</div>
            </div>
            <SourceFollowButton {...this.props}></SourceFollowButton>
          </div>
          
        </div>
      </div>)   
  }
}
export default withRouter(SourceCard)