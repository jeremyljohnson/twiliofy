import {
  SET_USER_ID,
  REGISTERED,
  SET_ROOM_ID,
  SET_MEETING_TYPE,
  LOCAL_PARTICIPANT_JOINING_ROOM,
  LOCAL_PARTICIPANT_JOINED_ROOM,
  LOCAL_PARTICIPANT_LEAVING_ROOM,
  LOCAL_PARTICIPANT_LEFT_ROOM,
  PARTICIPANTS_UPDATED,
  PARTICIPANT_JOINED_VIDEO,
  PARTICIPANT_LEFT_VIDEO,
  START_SCREENSHARE,
  STARTED_SCREENSHARE,
  END_SCREENSHARE,
  ENDED_SCREENSHARE,
  CHANGE_ACTIVITY,
  ACTIVITY_CHANGED,
  SET_ROOM_DIMENSIONS,
  USER_JOINED,
  USER_LEFT,
  REGISTER,
  NOTIFICATION_EXPIRED
} from '../constants';

import CommonUtility from '../utils/common-utility';
import { RemoteParticipant } from 'twilio-video';
import WebSocketService from '../api/websocket-service';

// TODO: Create 2 new actions, one for requesting a Twilio token, and one for storing the received token

let webSocketService: WebSocketService;


export const setUserId = () => {
  // creates a random username for the websocket service and Twilio video
  const userId = CommonUtility.getUuid();
  return {
    type: SET_USER_ID,
    payload: {
      userId: userId
    }
  };
}

export const notificationExpired = () => {
  return {
    type: NOTIFICATION_EXPIRED,
  };
}

export const registerWebsocketService = async (userId: string, sessionId: string) => {
  webSocketService = new WebSocketService({userId: userId, sessionId: sessionId});
  return {
    type: REGISTER
  }
}

export const registered = (userId: string, sessionId: string) => {
  return {
    type: REGISTERED,
    payload: {
      userId: userId,
      sessionId: sessionId
    }
  };
};

export const userJoinedWebsockets = (userId: string, sessionId: string) => {
  return {
    type: USER_JOINED,
    payload: {
      userId: userId,
      sessionId: sessionId
    }
  };
};

export const userLeftWebsockets = (userId: string, sessionId: string) => {
  return {
    type: USER_LEFT,
    payload: {
      userId: userId,
      sessionId: sessionId
    }
  };
};

export const setRoomId = (roomId: string) => {
  return {
    type: SET_ROOM_ID,
    payload: {
      roomId: roomId
    }
  };
};

export const setMeetingType = (meetingType: string) => {
  return {
    type: SET_MEETING_TYPE,
    payload: {
      meetingType: meetingType
    }
  };
};

export const setRoomDimensions = (width: number, height: number) => {
  return {
    type: SET_ROOM_DIMENSIONS,
    payload: {
      width: width,
      height: height
    }
  };
};

export const joinRoom = () => {
  // TODO: generalize this for all participants
  return {
    type: LOCAL_PARTICIPANT_JOINING_ROOM
  };
};

export const joinedRoom = () => {
  return {
    type: LOCAL_PARTICIPANT_JOINED_ROOM
  };
};

export const leaveRoom = () => {
  if (webSocketService) {
    webSocketService.destroy();
  }
  return {
    type: LOCAL_PARTICIPANT_LEAVING_ROOM
  };
};

export const leftRoom = () => {

  return {
    type: LOCAL_PARTICIPANT_LEFT_ROOM
  };
};

export const participantsUpdated = (participants: Map<string, RemoteParticipant>) => {
  return {
    type: PARTICIPANTS_UPDATED,
    payload: {
      participants: participants
    }
  };
};

export const participantJoinedVideo = (participant: RemoteParticipant) => {
  return{ 
    type: PARTICIPANT_JOINED_VIDEO,
    payload: {
      participant: participant
    }
  };
};

export const participantLeftVideo = (participant: RemoteParticipant) => {
  return {
    type: PARTICIPANT_LEFT_VIDEO,
    payload: {
      participant: participant
    }
  }
}
export const startScreenshare = (userId: string) => {
  return {
    type: START_SCREENSHARE,
    payload: userId
  };
};

export const startedScreenshare = (userId: string) => {
  return {
    type: STARTED_SCREENSHARE,
    payload: userId
  };
};

export const endScreenshare = (userId: string) => {
  return {
    type: END_SCREENSHARE,
    payload: userId
  };
};

export const endedScreenshare = (userId: string) => {
  return {
    type: ENDED_SCREENSHARE,
    payload: userId
  };
};

export const changeActivity = (activityType: string) => {
  webSocketService.changeActivity(activityType);
  return {
    type: CHANGE_ACTIVITY,
    payload: {
      activityType: activityType
    }
  };
};

export const activityChanged = (userId: string, sessionId: string, activityType: string) => {
  return {
    type: ACTIVITY_CHANGED,
    payload: {
      userId: userId,
      sessionId: sessionId,
      activityType: activityType
    }
  };
};