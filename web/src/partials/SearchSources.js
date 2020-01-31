import './SearchSources.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from "@fortawesome/free-solid-svg-icons";

class SearchSources extends Component {
  constructor(props){
    super(props)
    this.state = {
      searchQuery: props.location.pathname.startsWith('/search/') ? decodeURIComponent(props.location.pathname.substring(8)) : ""
    }
  }

  handleNewSearchQuery(event) {
    this.setState({searchQuery: event.target.value})
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      this.searchSources()
    }
  }

  searchSources() {
    if (this.state.searchQuery && this.state.searchQuery.trim()) {
        this.props.history.push('/search/' + encodeURIComponent(this.state.searchQuery))
    }
  }

  render() {
    return (
      <div className="search-souces">
        <input 
          type="text" 
          placeholder="Search by website or RSS link" 
          value={this.state.searchQuery} 
          onChange={e => this.handleNewSearchQuery(e)}
          onKeyDown={e => this.onKeyDown(e)} />
        <FontAwesomeIcon icon={faSearch} onClick={() => this.searchSources()} title="Search" />
      </div>
      )   
  }
}
export default withRouter(SearchSources)