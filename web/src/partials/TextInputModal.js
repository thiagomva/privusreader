import './TextInputModal.css'
import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'

class TextInputModal extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      inputValue: props.inputValue,
      error: null,
      previousName: props.inputValue
    }
  }

  componentDidMount() {
    setTimeout(() => { this.textInput && this.textInput.select() }, 100)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.inputValue !== this.props.inputValue) {
      this.setState({ inputValue: this.props.inputValue, previousName: this.props.inputValue, error: null })
    }
  }

  handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value }, () => this.validateDuplicateName(this.state.inputValue))
  }

  onConfirmed = (e) => {
    e.preventDefault()
    if (!this.state.error) {
      if (!this.state.inputValue || !this.state.inputValue.trim()) {
        this.setState({ error: "Name must be informed" })
      } else {
        this.props.onHide(true, this.state.inputValue)
      }
    }
  }

  validateDuplicateName(value) {
    var error = null
    if (this.props.categories && value !== this.state.previousName) {
      for (var id in this.props.categories) {
        if (this.props.categories[id].name === value) {
          error = "Already exists a feed with the same name"
          break
        }
      }
    }
    this.setState({ error: error })
  }

  hide = () => {
    this.props.onHide(false)
  }

  render() {
    return (
      <Modal className="text-input-modal" centered={true} size="sm" show={true} onHide={this.hide}>
        <form onSubmit={this.onConfirmed}>
        <Modal.Header closeButton>
          {this.props.title}
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-12">
              <div className="name-input-wrapper">
                <input type="text" placeholder="Name" ref={(input) => this.textInput = input} value={this.state.inputValue} onChange={this.handleInputChange} />
                {this.state.error && <span>{this.state.error}</span>}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="alert-cancel-btn btn" onClick={this.hide}>Cancel</button>
          <button type="submit" className="action-btn btn" disabled={!this.state.inputValue || this.state.error} onClick={this.onConfirmed}>OK</button>
        </Modal.Footer>
        </form>
      </Modal>
    )
  }
}
export default TextInputModal
