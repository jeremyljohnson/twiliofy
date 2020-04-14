import uuidv4 from 'uuid/v4';

export default class CommonUtility {

  // Used for making API calls to Twilio, specifically for retrieving capability tokens.
  static httpRequest = (url: string) => {
    return new Promise((resolve, reject) => {
      const request: XMLHttpRequest = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          const data: string = JSON.parse(request.responseText);
          if (data) {
            resolve(data);
          }
          else {
            console.warn('did not receive data when making http request, rejecting');
            reject();
          }
        }
      };

      request.onerror = (error) => {
        // There was a connection error of some sort
        console.error('error when making request: ' + error);
        reject('error');
      };

      request.send();
    });
  }

  // returns random characters approx 10 characters long
  static getRandomString = () => {
    return Math.random().toString(36).substring(3).toLocaleLowerCase()
  }

  // generates new random uuid for room name
  static getUuid = () => {
    return uuidv4();
  }

}