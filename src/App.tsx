import React from 'react';
import { Router, Route } from 'react-router-dom';
import OuterContainer from './components/outer-container';
import createBrowserHistory from './history';

export interface AppProps {
}

export interface AppState {
}

export default class App extends React.Component <AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
  }

  render() {
    return (
      <Router history={createBrowserHistory}>
        
          <Route path='/' exact component={OuterContainer} />
          <Route path='/:id' exact component={OuterContainer} />

      </Router>
    );
  }
}
