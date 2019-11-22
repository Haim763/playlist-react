import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback
} from 'reactstrap';
import { MAXIMUM_TRACKS, getTrackByPlaylistAdditionId } from '../utils';

export default class TrackModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      trackName: '',
      artistName: '',
      trackNameIsValid: false,
      oldTrackToDelete: '',
      confirmAddAndDelete: false,
    }
  }

  shouldComponentUpdate(nextProps) {
    let oldTrackToDelete = '';

    if (!this.state.oldTrackToDelete && nextProps.tracksList.length > MAXIMUM_TRACKS - 1) {
      oldTrackToDelete = nextProps.tracksList
        .reduce((oldest, track) => {
          if (!oldest || track.playlistAdditionId < oldest.playlistAdditionId)
            return track;
          return oldest;
        })

      this.setState({ oldTrackToDelete });
      return false;
    }

    return true;
  }

  handleTextChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
      [name === 'trackName' ? 'trackNameIsValid' : '']: value.length > 0
    });
  }

  handleSelectChange = (e) => {
    const { name, value } = e.target;
    const { tracksList } = this.props;

    this.setState({
      [name]: getTrackByPlaylistAdditionId(tracksList, value),
    });
  }

  handleSubmit = (e) => {
    e.preventDefault(); // Prevent reloading of the page (default behavior of submit).

    const { trackName, artistName, oldTrackToDelete } = this.state;
    if (trackName.length > 0) {
      if (this.props.tracksList.length > MAXIMUM_TRACKS - 1) {
        this.props.deleteTrackByID(oldTrackToDelete.playlistAdditionId);
        this.setState({ oldTrackToDelete: '', confirmAddAndDelete: false })
      }
      this.props.addTrack(trackName, artistName);
      this.setState({ trackName: '', artistName: '' });
      this.props.closePopup();
    }
  }

  setConfirmAddAndDelete = (confirmAddAndDelete) => {
    this.setState({ confirmAddAndDelete })
  }

  deleteConfirmed = () => {
    const { selectedTrackToDelete, closePopup, deleteTrackByID } = this.props;

    closePopup();
    deleteTrackByID(selectedTrackToDelete.playlistAdditionId);
  }

  render() {
    const { trackName, artistName, trackNameIsValid, oldTrackToDelete, confirmAddAndDelete } = this.state;
    const { closePopup, isOpen, selectedTrackToDelete, tracksList } = this.props;
    const isOverLimit = (tracksList.length > MAXIMUM_TRACKS - 1);

    return (
      <Modal isOpen={isOpen} toggle={closePopup}>
        {(selectedTrackToDelete || confirmAddAndDelete) ?
          <>
            <ModalHeader toggle={closePopup}>
              "{selectedTrackToDelete ? selectedTrackToDelete.track_name : oldTrackToDelete.track_name}" will be deleted. Are you sure?
            </ModalHeader>
            <ModalFooter>
              <Button color="primary" onClick={selectedTrackToDelete ? this.deleteConfirmed : this.handleSubmit}>Delete</Button>{' '}
              <Button color="secondary" onClick={selectedTrackToDelete ? closePopup : () => this.setConfirmAddAndDelete(false)}>Cancel</Button>
            </ModalFooter>
          </>
          :
          <Form onSubmit={isOverLimit ? () => this.setConfirmAddAndDelete(true) : this.handleSubmit} autoComplete="off">
            <ModalHeader toggle={closePopup}>{'New Track'}</ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label for="title">Track name</Label>
                <Input invalid={!trackNameIsValid} type="text" name="trackName" value={trackName} onChange={this.handleTextChange} />
                <FormFeedback>{'Name must not be empty'}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="title">Artist name</Label>
                <Input type="text" name="artistName" value={artistName} onChange={this.handleTextChange} placeholder="optional" />
              </FormGroup>
              {isOverLimit &&
                <FormGroup>
                  <Label for="oldTrackToDelete">Track to delete</Label>
                  <Input type="select" name="oldTrackToDelete" value={(oldTrackToDelete || {}).playlistAdditionId} onChange={this.handleSelectChange}>
                    {tracksList.map(track => (
                      <option key={track.playlistAdditionId} value={track.playlistAdditionId}>{track.track_name}</option>
                    ))}
                  </Input>
                </FormGroup>
              }
            </ModalBody>
            <ModalFooter>
              <div className="d-flex justify-content-center align-items-center w-100">
                <Button className="flex-fill m-2" type="submit" color="success"><FontAwesomeIcon icon={faSave} /> Add</Button>
              </div>
            </ModalFooter>
          </Form>
        }
      </Modal>
    )
  }
}
