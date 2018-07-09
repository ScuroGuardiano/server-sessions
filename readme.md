[![NPM](https://nodei.co/npm/server-sessions.png)](https://nodei.co/npm/server-sessions/)  
Session storage manager that use Sequelize and SQLite with Typescript support

## Install
```bash
    npm install server-sessions
```
## Test
To test run
```bash
    npm install
    npm test
```

# Getting started
## Creating instance
### Promises
```js
    const ServerSessions = require('server-sessions');
    ServerSessions.init({
        expireTime: 24 * 60 * 60 * 1000,
        renewTimestamp: 60 * 60 * 1000,
        storagePath: './sessions.sqlite'
    })
    .then(sessionManager => {
        //Now you can use session manager
    })
```
### async/await
```js
    const ServerSessions = require('server-sessions');
    const sessionManager = await ServerSessions.init({
        expireTime: 24 * 60 * 60 * 1000,
        renewTimestamp: 60 * 60 * 1000,
        storagePath: './sessions.sqlite'
    });
```
## Creating session
### Promises
```js
    sessionManager.createSession({userId: 123})
    .then(token => {
        //Send token to client or store it somewhere
    });
```
### async/await
```js
    let token = await sessionManager.createSession({userId: 123});
```
## Retrieve session data & update
*Note: Session is renewed on every update*
### Promises
```js
    sessionManager.retrieveSession(token)
    .then(data => {
        data.userId = 1337;
        return sessionManager.updateSession(token, data);
    })
    .then(() => {
        //done
    })
    .catch(err => {
        if(err instanceof ServerSessions.SessionExpiredError) {
            //session expired
        }
        if(err instanceof ServerSessions.SessionNotFoundError) {
            //session nout found
        }
    });
```
### async/await
```js
    try {
        let data = await sessionManager.retrieveSession(token);
        data.userId = 13337;
        await sessionManager.updateSession(token, data);
        //done
    }
    catch(err) {
        if(err instanceof ServerSessions.SessionExpiredError) {
            //session expired
        }
        if(err instanceof ServerSessions.SessionNotFoundError) {
            //session nout found
        }
    }
```
## Remove session
### Promises
```js
    sessionManager.removeSession(token)
    .then(() => {
        //done;
    })
```
### async/await
```js
    await sessionManager.removeSession(token);
    //done
```
## Remove expired sessions
### Promises
```js
    sessionManager.removeExpiredSessions()
    .then(removed => {
        console.log("Removed " + removed + " sessions");
    });
```
### async/await
```js
    let removed = await sessionManager.removeExpiredSessions();
    console.log("Removed " + removed + " sessions");
```
## Manually renew session
*Note: expire time after renew is specified as renewTimestamp in options*
```js
    sessionManager.renewSession(token)
    .then(() => {
        //renewed
    })
    .catch(err => {
        if(err instanceof ServerSessions.SessionNotFoundError) {
            //session not found
        }
    });
```

# Typescript support
With Typescript you can specify type of session data, like that:
```ts
interface IProduct {
    id: number;
    amount: number;
}
interface ISessionData {
    userId?: string;
    basket: IProduct[];
}
let sessionManager: ServerSessions.SessionManager<ISessionData> = await ServerSessions.init<ISessionData>(); //Remember to specify type of SessionManager if you need it
```

# License
Copyright 2018 ScuroGuardiano

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.