import io from 'socket.io-client';

export default class WebSocketControl {

  protected socket: SocketIOClient.Socket;
  private accessToken: string;
  private sessionId: string;
  private userId: string;

  constructor(url: string, initialSessionId: string, userId: string) {

    this.accessToken = 'some-access-token';
    this.sessionId = initialSessionId;
    this.userId = userId;

    let wsOpts: SocketIOClient.ConnectOpts = {};
    wsOpts.query = this.getQueryString();
    wsOpts.transports = ['polling', 'websocket'];
    wsOpts.forceNew = true;

    this.socket = io.connect(url, wsOpts);
    this.socket.on('connect', () => {
      console.log('websocket connected');
      // TODO: update state with connected info
    });

    this.socket.on('disconnect', () => {
     console.log('websocket disconnected');
     // TODO: update state with connected info
    });

    this.socket.on('error', (error: any) => {
      console.log('client websocket error: ' + JSON.stringify(error));
      // TODO: update state with connected info
    });
  }

  disconnect = (() => {
    this.socket.disconnect();
  });

  updateAccessToken = ((accessToken: string) => {
    console.log('Updating websocket access token');
    this.accessToken = accessToken;
    this.setQueryString();
  });

  updateSessionId = ((sessionId: string) => {
    this.sessionId = sessionId;
    this.setQueryString();
  });

  emit = (event: string, ...args: any[]) => {
    this.socket.emit(event, ...args);
    return this;
  };

  on = (event: string, handler: Function) => {
    this.socket.on(event, handler);
    return this;
  };

  private getQueryString = (() => {
    return `token=${this.accessToken}&sessionId=${this.sessionId}&userId=${this.userId}`;
  });

  private setQueryString = (() => {
    (this.socket as any).query = this.getQueryString();
  });

}
