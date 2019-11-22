import React, { Component } from 'react'
import SingleTrack from './SingleTrack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import TrackModal from './TrackModal';
import {
  getTracks,
  getTrackData,
  saveTracksToLocalStorage,
  getNewId,
  sortTracksBy,
  getTrackByPlaylistAdditionId,
  getSortedByFromLocalStorage
} from '../utils';
import './Playlist.css';
import { Input } from 'reactstrap';

export default class Playlist extends Component {
  state = {
    tracksList: [],
    moviesApiPage: 0,
    showPopup: false,
    selectedTrackToDelete: {},
    sortedBy: getSortedByFromLocalStorage()
  }

  componentDidMount() {
    const { setIsLoading } = this.props;
    setIsLoading(true);

    getTracks()
      .then(res => {
        if (res.Status !== 'Success')
          console.error('Unable to get tracks. <SOME ERROR HANDLING>');

        this.setState({ tracksList: (res.tracks || []) })
        setIsLoading(false);
      });
  }

  openPopupToDelete = (e, selectedTrackToDelete) => {
    e.stopPropagation();
    this.setState({ showPopup: true, selectedTrackToDelete })
  }

  openPopupToAdd = () => {
    this.setState({ showPopup: true, selectedTrackToDelete: null })
  }

  addTrack = (trackName, artistName = '') => {
    const { setIsLoading } = this.props;
    setIsLoading(true);

    getTrackData(trackName, artistName)
      .then(res => {
        if (res.Status !== 'Success')
          console.error('Unable to get track data. <SOME ERROR HANDLING>');
        if (!res.track)
          return setIsLoading(false);

        this.setState((state) => {
          res.track = {
            ...res.track,
            playlistAdditionId: getNewId(),
          }
          if (state.tracksList.find(track => track.track_id === res.track.track_id)) // prevent duplicate elements
            return setIsLoading(false);
          let tracksOrdered = [...state.tracksList];
          state.tracksList.unshift(res.track);
          tracksOrdered.push(res.track);
          saveTracksToLocalStorage(tracksOrdered);
          setIsLoading(false);
          return { ...state }
        })
      });
  }

  deleteTrackByID = (playlistAdditionId) => {

    this.setState((state) => {
      const newTracksList = state.tracksList.filter(track => track.playlistAdditionId !== playlistAdditionId);
      saveTracksToLocalStorage(newTracksList);

      return {
        ...state,
        tracksList: newTracksList
      }
    }
    );

  }

  handleTrackSelect = (playlistAdditionId) => {
    const track = getTrackByPlaylistAdditionId(this.state.tracksList, playlistAdditionId);
    this.props.setSelectedTrack(track);

    this.props.history.push("/track-info");
  }

  handleSelectChange = (e) => {
    const { name, value } = e.target;
    const { tracksList } = this.state;

    if (name === 'selectSort')
      this.setState({
        sortedBy: value,
        tracksList: sortTracksBy(tracksList, value)
      })
  }

  render() {
    const { showPopup, selectedTrackToDelete, tracksList, sortedBy } = this.state;

    return (
      <>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <TrackModal
            isOpen={showPopup}
            closePopup={() => this.setState({ showPopup: false })}
            selectedTrackToDelete={selectedTrackToDelete}
            deleteTrackByID={this.deleteTrackByID}
            addTrack={this.addTrack}
            tracksList={tracksList}
          />
        </div>
        <h1>My Cool Playlist</h1>
        <div className={'add_track'} onClick={() => this.openPopupToAdd()}>
          <FontAwesomeIcon icon={faPlus} />
        </div>

        <Input style={{ width: '300px', margin: 'auto' }} type="select" name="selectSort" value={sortedBy} onChange={this.handleSelectChange}>
          <option value="">By addition order</option>
          <option value="album_name">By album</option>
          <option value="artist_name">By artist</option>
          <option value="track_name">By track</option>
        </Input>

        <div className={'playlist'}>
          {(tracksList || []).map((track) => (
            <div key={track.playlistAdditionId} className="card-item  m-2" onClick={() => this.handleTrackSelect(track.playlistAdditionId)}>
              <SingleTrack track={track} onDelete={(e) => this.openPopupToDelete(e, track)} />
            </div>
          ))}
        </div>
      </>
    )
  }
}