import './LandingPage.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

class LandingPage extends Component {

    constructor(props){
        super(props)
        this.state = {
        }
    }

    onClickGetStart() {
        if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
          this.props.signIn()
        } else {
          this.props.history.push("/explore")
        }
    }

    render() {
        return (
            <div className="landing-page">
                <div className="landing-page-header">
                    <img className="privus-reader-logo" src="/logo2.png" alt="Privus Reader" onClick={() => this.props.history.push('/explore')} />
                    <h2>A privacy-focused online reader</h2>
                    <p>A secured space where you can privately follow all your favorite sources and get the news that matters most to you.</p>
                    <img className="privus-reader d-none d-lg-block" src="/privus_reader.png" alt="Privus Reader" />
                    <img className="background-img d-none d-lg-block" src="/img_landing.jpg" alt="Privus Reader" />
                </div>
                <div className="landing-page-body">
                    <button onClick={() => this.onClickGetStart()}>GET STARTED</button>
                    <div>
                        <div className="landing-feature">
                            <span><img src="/icon_feed.png" alt="All the Feeds" /></span>
                            <div>
                                <strong>All the Feeds</strong>
                                <div>Subscribe to all your news feeds and organize them the way you want.</div>
                            </div>
                        </div>
                        <div className="landing-feature">
                            <span><img src="/icon_favorite.png" alt="Favorites" /></span>
                            <div>
                                <strong>Favorites</strong>
                                <div>Save articles and easily get back to them.</div>
                            </div>
                        </div>
                        <div className="landing-feature">
                            <span><img src="/icon_productive.png" alt="Be More Productive" /></span>
                            <div>
                                <strong>Be More Productive</strong>
                                <div>Clean reading experience optimized for productivity.</div>
                            </div>
                        </div>
                        <div className="landing-feature">
                            <span><img src="/icon_private.png" alt="100% Private & Encrypted" /></span>
                            <div>
                                <strong>100% Private & Encrypted</strong>
                                <div>No one but you has access to your data. All your data is stored encrypted with keys only you control.</div>
                            </div>
                        </div>
                        <div className="landing-feature">
                            <span><img src="/icon_simple.png" alt="Simple & Easy to use" /></span>
                            <div>
                                <strong>Simple & Easy to use</strong>
                                <div>It's intuitive, easy to use, just search for a blog, magazine or newspaper you like to read and add it to your feed.</div>
                            </div>
                        </div>
                        <div className="landing-feature">
                            <span><img src="/icon_opensource.png" alt="Free and Open Source" /></span>
                            <div>
                                <strong>Free and Open Source</strong>
                                <div>You can also run Privus Reader locally on your computer, clone it from Github.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="landing-page-footer">PRIVUS READER - 2019</div>
            </div>
        )
    }
}
export default withRouter(LandingPage)