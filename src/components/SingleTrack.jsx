import React, { Component } from 'react';
import {
  Card,
  CardImg,
  CardBody,
  CardTitle,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import "./SingleTrack.css";
import { getAlbumData } from '../utils';

export default class SingleTrack extends Component {
  state = {
    imgSrc: null
  }

  componentDidMount() {
    const { album_id } = this.props.track;

    if (album_id)
      getAlbumData(album_id)
        .then(albumData => {
          if (albumData.album_coverart_100x100)
            this.setState({ imgSrc: albumData.album_coverart_100x100 })
        })
  }

  render() {
    const { album_name, artist_name, track_name } = this.props.track;
    const { imgSrc } = this.state;
    return (
      <Card className={`single_track text-center`}>
        <div className='img-crop'>
          <CardImg top width="100%"
            src={imgSrc || '/song_placeholder.jpeg'}
            alt={album_name} />
        </div>
        <CardBody>
          <CardTitle>
            {` ${track_name}`}
            <br />
            <span style={{ fontSize: '15px' }}>
              {` Artist: ${artist_name}`}
            </span>
            <br />
            <span style={{ fontSize: '10px' }}>
              {` Album: ${album_name}`}
            </span>
            <br />
          </CardTitle>
          <div>
            <FontAwesomeIcon className="more_information_icon" icon={faInfoCircle} />
            <FontAwesomeIcon className="delete_icon" onClick={(e) => this.props.onDelete(e)} icon={faTrashAlt} />
          </div>
        </CardBody>
      </Card>
    );
  }
}