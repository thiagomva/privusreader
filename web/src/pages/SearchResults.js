import './SearchResults.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import ServerManager from '../util/serverManager'
import SourceCard from '../partials/SourceCard'

class SearchResults extends Component {

    constructor(props){
        super(props)
        this.state = this.getStateObject(props)
    }

    getStateObject(props){
        return {
            searchQuery: decodeURIComponent(props.match.params.searchQuery),
            sources: null
        }
    }

    componentDidMount(){
        this.listRss();
    }

    listRss(){
        ServerManager.searchRss(this.state.searchQuery).then(results => {
            var sources = []
            if(results == null){
                results = []
            }
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (!result.state || result.state !== "dormant") {
                    sources.push(result)
                }
            }
            this.setState({sources: sources})
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps && prevProps.match.params.searchQuery && this.props.match.params.searchQuery && 
            prevProps.match.params.searchQuery !== this.props.match.params.searchQuery){
                this.setState(this.getStateObject(this.props), () => this.listRss())
            }
      }


    render() {
        return (
            <div className="results-content">
                <div className="feed-title py-3">SEARCH RESULTS</div>
                <div className="results">
                    {this.state.sources && this.state.sources.map((source) => 
                    (
                        <SourceCard key={source.feedId} source={source} {...this.props}></SourceCard>
                    ))}
                    {this.state.sources && this.state.sources.length == 0 && 
                        <div className="empty-feed">
                            <div className="empty-message">No results for your search</div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}
export default withRouter(SearchResults)