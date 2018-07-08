const mocha = require('mocha');
const assert = require('assert');
const ServerSessions = require('./../index');
const fs = require('fs');

function delay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    })
}
let sm;

describe('Session test', function () {
    before(function (done) {
        ServerSessions.init({
            expireTime: 1000,
            storagePath: './test-sessions.sqlite',
            renewTimestamp: 6000
        }).
        then(sessionManager => {
            sm = sessionManager;
            done();
        });
    });

    it('create and remove session', async function() {
        let sessionToken = await sm.createSession();
        assert(typeof sessionToken === 'string', "Session token must be string");
        let deletedSession = await sm.removeSession(sessionToken);
        assert(deletedSession === true, "Remove result must be true");
    })
    it('create, retrieve and remove session', async function() {
        let sessionToken = await sm.createSession({username: "Scuro Guardiano"});
        assert(typeof sessionToken === 'string', "Session token must be string");
        let sessionData = await sm.retrieveSession(sessionToken);
        assert(sessionData.username === "Scuro Guardiano", "username in session date must be 'Scuro Guardiano'");
        let deletedSession = await sm.removeSession(sessionToken);
        assert(deletedSession === true, "Remove result must be true");
    })
    it('create, update, retrieve and remove session', async function() {
        let sessionToken = await sm.createSession({
            username: "Scuro Guardiano"
        });
        assert(typeof sessionToken === 'string', "Session token must be string");
        await sm.updateSession(sessionToken, {
            oldUsername: "Scuro Guardiano",
            username: "Guardiano <T extends Scuro>"
        });
        let sessionData = await sm.retrieveSession(sessionToken);
        assert(sessionData.oldUsername === "Scuro Guardiano", "oldUsername in session date must be 'Scuro Guardiano'");
        assert(sessionData.username === "Guardiano <T extends Scuro>", "username in session data must be 'Guardiano <T extends Scuro>'");
        let deletedSession = await sm.removeSession(sessionToken);
        assert(deletedSession === true, "Remove result must be true");
    });
    it('remove expired sessions', async function() {
        for(let i = 0; i < 5; i++) {
            await sm.createSession();
        }
        await delay(1001);
        let sessionToken = await sm.createSession();
        let deleted = await sm.removeExpiredSessions();
        assert(deleted === 5, "Deleted session must be 5");
        await sm.removeSession(sessionToken);
    });
    it('create sessions, renew some, remove expired', async function() {
        let sessionsTokens = [];
        for (let i = 0; i < 5; i++) {
            sessionsTokens.push(await sm.createSession());
        }
        await sm.renewSession(sessionsTokens[0]);
        await sm.updateSession(sessionsTokens[4], {theanswer: 42}); //Update is renewing session too
        await delay(1001);
        let deleted = await sm.removeExpiredSessions();
        assert(deleted === 3, "Deleted sessions must be 3");
        await sm.removeSession(sessionsTokens[0]);
        await sm.removeSession(sessionsTokens[4]);
    });
    it('create session, wait for expire and try read data, then remove', async function() {
        let token = await sm.createSession({"1337":"1337"});
        await delay(1001);
        let error = false;
        try {
            let data = await sm.retrieveSession(token);
        }
        catch(err) {
            if(err instanceof ServerSessions.SessionExpiredError) {
                error = true;
            }
        }
        assert(error === true, "Error should occur");
        await sm.removeSession(token);
    })
});