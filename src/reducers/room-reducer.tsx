import { 
  SET_USER_ID,
  SET_ROOM_ID,
  SET_MEETING_TYPE,
  SET_ROOM_DIMENSIONS,
  USER_JOINED,
  USER_LEFT,
  LOCAL_PARTICIPANT_JOINING_ROOM,
  LOCAL_PARTICIPANT_JOINED_ROOM,
  LOCAL_PARTICIPANT_LEAVING_ROOM,
  LOCAL_PARTICIPANT_LEFT_ROOM,
  PARTICIPANTS_UPDATED,
  // PARTICIPANT_JOINING_ROOM,
  PARTICIPANT_JOINED_ROOM,
  // PARTICIPANT_LEAVING_ROOM,
  PARTICIPANT_LEFT_ROOM,
  PARTICIPANT_JOINED_VIDEO,
  PARTICIPANT_LEFT_VIDEO,
  NOTIFICATION_EXPIRED
} from '../constants';

import { RemoteParticipant } from 'twilio-video';

const INITIAL_STATE = {
  userId: '',
  roomId: '',
  meetingType: '',
  isJoiningRoom: false,
  hasJoinedRoom: false,
  isLeavingRoom: false,
  hasLeftRoom: false,
  width: 500,
  height: 500,
  participants: {} as Map<string, RemoteParticipant>,
  participantNumber: 0,
  notificationMessage: ''
};

export default (state = INITIAL_STATE, action: any) => {
  switch (action.type)  {
    case SET_USER_ID:
      return {...state, userId: action.payload.userId};
    case SET_ROOM_ID:
      return {...state, roomId: action.payload.roomId};
    case SET_MEETING_TYPE:
      return {...state, meetingType: action.payload.meetingType};
    case SET_ROOM_DIMENSIONS:
      return {...state, width: action.payload.width, height: action.payload.height};
    case LOCAL_PARTICIPANT_JOINING_ROOM:
      return {...state, isJoiningRoom: true, hasJoinedRoom: false, isLeavingRoom: false, hasLeftRoom: false};
    case LOCAL_PARTICIPANT_JOINED_ROOM:
      return {...state, isJoiningRoom: false, hasJoinedRoom: true, isLeavingRoom: false, hasLeftRoom: false};
    case LOCAL_PARTICIPANT_LEAVING_ROOM:
      return {...state, isJoiningRoom: false, hasJoinedRoom: false, isLeavingRoom: true, hasLeftRoom: false};
    case LOCAL_PARTICIPANT_LEFT_ROOM:
      return {...state, isJoiningRoom: false, hasJoinedRoom: false, isLeavingRoom: false, hasLeftRoom: true, participants: {} as Map<string, RemoteParticipant>, participantNumber: 0};
    case PARTICIPANTS_UPDATED:
      return {...state, participants: action.payload.participants, participantNumber: action.payload.participants.size};
    case PARTICIPANT_JOINED_VIDEO:
      {
        const existingParticipant = state.participants.get(action.payload.participant.SID);
        if (existingParticipant) {
          return {...state, participantNumber: state.participants.size};
        }
        else {
          let newParticipantList = state.participants;
          newParticipantList.set(action.payload.participant.SID, action.payload.participant);
          return {...state, participants: newParticipantList, participantNumber: state.participantNumber + 1};
        }
      }
    case PARTICIPANT_LEFT_VIDEO:
      {
        const existingParticipant = state.participants.get(action.payload.participant.SID);
        if (!existingParticipant) {
          return {...state, participantNumber: state.participants.size};
        }
        else {
          let newParticipantList = state.participants;
          newParticipantList.delete(action.payload.participant.SID);
          return {...state, participants: newParticipantList, participantNumber: state.participantNumber - 1};
        }
      }
    case PARTICIPANT_JOINED_ROOM:
      return {...state, participants: action.payload.participants};
    case PARTICIPANT_LEFT_ROOM:
      return {...state, participants: action.payload.participants};
    case USER_JOINED:
      const message = `${action.payload.userId} has joined`;
      console.warn('setting notificationMessage to ' + message);
      return {...state, notificationMessage: message};
    case USER_LEFT:
      return {...state, notificationMessage: `${action.payload.userId} has left`};
    case NOTIFICATION_EXPIRED:
        return {...state, notificationMessage: ''};
    default:
      return state;
  }
};