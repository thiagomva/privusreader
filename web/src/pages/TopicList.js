import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import ServerManager from '../util/serverManager'
import SourceCard from '../partials/SourceCard'

class TopicList extends Component {

    constructor(props){
        super(props)
        this.state = this.getStateObject(props)
    }

    getStateObject(props){
        return {
            topicName: decodeURIComponent(props.match.params.topicName),
            sources: null
        }
    }

    componentDidMount(){
        this.listTopics();
    }

    listTopics(){
        fetch('/data/' + this.props.match.params.topicName + '.json').then(
            res => res.json().then(data => this.setState({ sources:  data}))
        )
    }

    componentDidUpdate(prevProps) {
        if (prevProps && prevProps.match.params.topicName && this.props.match.params.topicName && 
            prevProps.match.params.topicName !== this.props.match.params.topicName){
                this.setState(this.getStateObject(this.props), () => this.listTopics())
            }
      }


    render() {
        return (
            <div className="results-content">
                <div className="feed-title py-3">{this.state.topicName.toUpperCase()}</div>
                <div className="results">
                    {this.state.sources && this.state.sources.map((source) => 
                    (
                        <SourceCard key={source.feedId} source={source} {...this.props}></SourceCard>
                    ))}
                </div>
            </div>
        )
    }
}
export default withRouter(TopicList)