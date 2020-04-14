import { combineReducers } from 'redux';
import activityReducer from './activity-reducer';
import roomReducer from './room-reducer';

export default combineReducers({
  activity: activityReducer,
  room: roomReducer
});