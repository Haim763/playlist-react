const proxyurl = "https://cors-anywhere.herokuapp.com/";
const url = 'https://api.musixmatch.com/ws/1.1';
const apiKey = '7629dddb1ec68ae1209b400db720c6ec';
export const MAXIMUM_TRACKS = 19;

export const getJSON = (url) => {
  console.log('fetching url', url);
  return fetch(proxyurl + url) // Using proxy to prevent CORS error on localhost
    .then(res => {
      return res.json();
    })
    .catch(err => err);
};

export const getTracks = () => {
  const tracks = getTracksFromLocalStorage();
  if (tracks) return Promise.resolve({
    tracks,
    Status: 'Success'
  });

  return getJSON(`${url}/track.search?apikey=${apiKey}`).then((data) => {
    let tracks = ((((data || {}).message || {}).body || {}).track_list || []);
    tracks = tracks.map(trackObj => {
      return {
        ...trackObj.track,
        playlistAdditionId: getNewId()
      }
    });

    saveTracksToLocalStorage(tracks);

    return ({
      Status: 'Success',
      tracks
    });
  }).catch((e) => {
    return {
      Status: 'Error',
      Error: e.stack
    };
  });
};

export const getTrackData = (trackName, artistName = null) => {
  if (!trackName)
    console.error('No track name provided <HANDLE ERROR>');

  let artistParam = artistName ? `q_artist=&${artistName}&` : '';

  return getJSON(`${url}/track.search?q_track=${trackName}&${artistParam}apikey=${apiKey}`)
    .then((data) => {
      const trackData = ((((data || {}).message || {}).body || {}).track_list || [])[0];

      return ({
        Status: trackData ? 'Success' : 'Error',
        ...trackData,
      });
    }).catch((e) => {
      return {
        Status: 'Error',
        Error: e.stack
      };
    });
};

export const getTrackLyrics = (trackId) => {
  if (!trackId)
    console.error('No track id provided <HANDLE ERROR>');

  return getJSON(`${url}/track.lyrics.get?track_id=${trackId}&apikey=${apiKey}`)
    .then((data) => {
      const lyrics = (((((data || {}).message || {}).body || {}).lyrics || {}).lyrics_body || '');

      return ({
        Status: lyrics ? 'Success' : 'Error',
        lyrics,
      });
    }).catch((e) => {
      return {
        Status: 'Error',
        Error: e.stack
      };
    });
};

export const getNewId = () => {
  const currentId = parseInt(localStorage.getItem('currentPlaylistId')) || 0;
  const newCurrentId = currentId + 1;
  localStorage.setItem('currentPlaylistId', newCurrentId);
  return newCurrentId;
}

export const getAlbumData = (albumId) => {
  if (!albumId)
    console.error('No album id provided <HANDLE ERROR>');

  return getJSON(`${url}/album.get?album_id=${albumId}&apikey=${apiKey}`)
    .then((data) => {
      const albumData = ((((data || {}).message || {}).body || {}).album || []);

      return ({
        Status: albumData ? 'Success' : 'Error',
        ...albumData
      });
    }).catch((e) => {
      return {
        Status: 'Error',
        Error: e.stack
      };
    });
};

export const saveTracksToLocalStorage = (tracks) => {
  if (typeof tracks === 'object')
    localStorage.setItem('tracks', JSON.stringify(tracks));
}

export const getTracksFromLocalStorage = () => {
  const tracks = localStorage.getItem('tracks');
  if (tracks) return JSON.parse(tracks)
}

export const getSortedByFromLocalStorage = () => {
  return localStorage.getItem('sortBy');
}

export const getTrackByPlaylistAdditionId = (tracksList, playlistAdditionId) => {
  return tracksList.find(track => track.playlistAdditionId == playlistAdditionId)
}

export const sortTracksBy = (tracksList, sortBy = null) => {
  let sortedList = [];
  switch (sortBy) {
    case 'album_name':
    case 'artist_name':
    case 'track_name':
      sortedList = tracksList.sort((track1, track2) => {
        return track1[sortBy] < track2[sortBy] ? -1 : 1; // Simple sorting of strings
      })
      break;
    default:
      sortedList = tracksList.sort((track1, track2) => {
        return track1.playlistAdditionId < track2.playlistAdditionId ? -1 : 1;
      })
  }

  localStorage.setItem('sortBy', sortBy);
  saveTracksToLocalStorage(sortedList);
  
  return sortedList;
}