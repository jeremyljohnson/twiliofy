import {
  SMALL_GROUP_VIDEO,
  SCREENSHARE,
  START_SCREENSHARE,
  STARTED_SCREENSHARE,
  END_SCREENSHARE,
  ENDED_SCREENSHARE
} from '../constants';

const INITIAL_STATE = {
  ownerId: '',
  activityType: SMALL_GROUP_VIDEO,
  documentId: '',
  collectionId: '',
  startingActivity: false,
  endingActivity: false
};

export default (state = INITIAL_STATE, action: any) => {
  console.warn('Activity Reducer got an action' );
  console.warn(action.type);

  switch (action.type)  {
    case START_SCREENSHARE: 
      return {
        ownerId: action.payload.userId,
        activityType: SCREENSHARE,
        documentId: '',
        collectionId: '',
        startingActivity: true,
        endingActivity: false
      };
    case STARTED_SCREENSHARE:
      return {
        ...state,
        ownerId: action.payload.userId,
        startingActivity: false,
        endingActivity: false
      };
    case END_SCREENSHARE:
      return {
        ownerId: action.payload.userId,
        activityType: SMALL_GROUP_VIDEO,
        documentId: '',
        collectionId: '',
        startingActivity: false,
        endingActivity: true
      };
    case ENDED_SCREENSHARE:
      return {
        ownerId: action.payload.userId,
        startingActivity: false,
        endingActivity: false
      };
    default:
      return state;
  }
};