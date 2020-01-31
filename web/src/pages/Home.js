import './Home.css'
import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import SearchSources from '../partials/SearchSources'
import { NavLink } from 'react-router-dom'

const FEATURED = [
    {
        title:'NEWS'
    },
    {
        title:'TECH'
    },
    {
        title:'FASHION'
    },
    {
        title:'BUSINESS'
    },
    {
        title:'DESIGN'
    },
    {
        title:'FOOD'
    },
    {
        title:'DIY'
    },
    {
        title:'PHOTOGRAPHY'
    },
    {
        title:'SPORTS'
    },
    {
        title:'CINEMA'
    },
    {
        title:'TRAVEL'
    },
    {
        title:'MUSIC'
    }
]

class Home extends Component {

    constructor(props){
        super(props)
        this.state = {
        }
    }

    componentDidMount(){
    }

    render() {
        return (
            <div className="home-content">
                <div className="search-title mb-5">DISCOVER THE BEST SOURCES</div>
                <SearchSources></SearchSources>                
                <div className="featured mt-5 mb-4">FEATURED</div>
                <div className="row">
                    {FEATURED.map(featured => (
                    <div key={featured.title} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <NavLink to={'/topic/'+ featured.title.toLowerCase()}>
                            <div className="featured-card" style={{backgroundImage:"url('./img_"+featured.title.toLowerCase()+".jpg')"}}>
                            <div className="featured-card-backdrop">{featured.title}</div>
                            </div>
                        </NavLink>
                    </div>))}
                </div>
            </div>
        )
    }
}
export default withRouter(Home)