import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import './TrackInfo.css'
import { getTrackLyrics } from '../utils';

export default class TrackInfo extends Component {
  state = {
    lyrics: ''
  }

  componentDidMount() {
    const { setIsLoading, track } = this.props;

    if (!track || !track.track_name || !track.has_lyrics)
      return;

    setIsLoading(true);

    getTrackLyrics(track.track_id)
      .then(res => {
        if (res.Status !== 'Success')
          console.error('Unable to get track lyrics. <SOME ERROR HANDLING>');

        if (!res.lyrics)
          return setIsLoading(false);

        this.setState({ lyrics: res.lyrics });
        setIsLoading(false);
      });

  }

  getGenres = () => {
    const { track } = this.props;

    return ((track.primary_genres || {}).music_genre_list || [])
      .map((genre, i) => {
        return (
          <label key={genre.music_genre.music_genre_id}>
            {
              (i > 0) ?
                ', ' + genre.music_genre.music_genre_name
                :
                genre.music_genre.music_genre_name
            }
          </label>
        )
      })
  }

  render() {
    const { track, history } = this.props;
    const { lyrics } = this.state;

    const genres = this.getGenres();
    return (
      <>
        <FontAwesomeIcon className="back_button" icon={faArrowLeft} onClick={() => history.push('/')} />
        <div className="track_info_container" >
          {(track && track.track_name) ?
            <>
              <h1>{track.track_name}</h1>
              <label>
                {track.artist_name}{track.album_name ? `, ${track.album_name}` : ''}
              </label>

              <br />

              {genres.length > 0 &&
                <label>
                  Genres: {genres}
                </label>
              }
              <div>
                {lyrics ?
                  <>
                    <h2>Lyrics</h2>
                    <span className="lyrics">{lyrics}</span>
                  </>
                  :
                  <h2>No further information</h2>
                }
              </div>
            </>
            :
            <h1>No track found</h1>
          }
        </div>
      </>
    )
  }
}
