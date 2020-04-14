import React from 'react';
import WebSocketControl from './websocket';
import store from '../store';
import {
  TEST_WEBSOCKET,
  REGISTERED,
  USER_JOINED,
  USER_LEFT,
  CHANGE_ACTIVITY,
  ACTIVITY_CHANGED
} from '../constants';
// TODO: find a better way to dispatch
import { registered, userJoinedWebsockets, userLeftWebsockets, activityChanged } from '../actions';


interface WebSocketServiceProps {
  userId: string;
  sessionId: string;
}

interface WebSocketServiceState {
}

export default class WebSocketService extends React.Component <WebSocketServiceProps, WebSocketServiceState> {

  private webSocketControl: WebSocketControl;
  private url: string;
  private sessionId: string;
  private userId: string;
  private store: any;

  constructor(props: WebSocketServiceProps) {
    super(props);
    this.userId = this.props.userId;
    this.sessionId = this.props.sessionId;
    this.url = process.env.REACT_APP_WEBSOCKET_URL || '';
    this.store = store;
    this.webSocketControl = new WebSocketControl(this.url, this.sessionId, this.userId);

    this.webSocketControl.on(REGISTERED, this.onRegistered);
    this.webSocketControl.on(USER_JOINED, this.onUserJoined);
    this.webSocketControl.on(USER_LEFT, this.onUserLeft);
    this.webSocketControl.on(ACTIVITY_CHANGED, this.onActivityChanged);
  }

  public destroy = () => {
    this.webSocketControl.disconnect();
  }

  public testWebsocket = (message: string) => {
    this.webSocketControl.emit(TEST_WEBSOCKET, {userId: this.userId, message: message});
  }

  public changeActivity = (activityType: string) => {
    console.log('about to change activity type to ' + activityType);
    this.webSocketControl.emit(CHANGE_ACTIVITY, {userId: this.userId, sessionId: this.sessionId, activityType: activityType});
  }

  private onRegistered = (payload: any) => {
    const { userId, sessionId } = payload;
    return store.dispatch(registered(userId, sessionId));
  }

  private onUserJoined = (payload: any) => {
    const { userId, sessionId } = payload;
    return store.dispatch(userJoinedWebsockets(userId, sessionId));
  }

  private onUserLeft = (payload: any) => {
    const {userId, sessionId } = payload;
    return store.dispatch(userLeftWebsockets(userId, sessionId));
  }

  private onActivityChanged = (payload: any) => {
    const { userId, sessionId, activityType } = payload;
    console.log('user ' + userId + ' in session ' + sessionId);
    console.log('changed the activity to ' + activityType);
    // TODO: Add documentId here?
    return store.dispatch(activityChanged(userId, sessionId, activityType));
  }

}