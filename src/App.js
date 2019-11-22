import React, {Component} from 'react';
import './App.css';
import Playlist from './components/Playlist';
import TrackInfo from './components/TrackInfo';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Loader from './components/Loader';

const history = createBrowserHistory();

export default class App extends Component {
  state = {
    selectedTrack: {},
    isLoading: false,
  }

  setIsLoading = (isLoading) => {
    this.setState({ isLoading });
  }
  
  render(){
    const {isLoading} = this.state;
    return (
      <div className="App">
        {isLoading && <Loader />}
        <Router history={history}>
          <Switch>
              <Route path="/track-info">
                <TrackInfo 
                track={this.state.selectedTrack}
                 history={history}
                 setIsLoading={this.setIsLoading}
                 />
              </Route>

              <Route path="/">
                <Playlist 
                history={history} 
                setSelectedTrack={(selectedTrack)=>this.setState({selectedTrack})}
                setIsLoading={this.setIsLoading}
                />
              </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}