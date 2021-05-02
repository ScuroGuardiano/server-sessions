const Sequelize = require('sequelize');
const stringify = require('safe-json-stringify');

console.warn("Using unsafe server-sessions. DO NOT USE IT FOR PRODUCTION");

if (process.env.LOAD_UNSAFE_SERVERSESSIONS != true) {
    console.error("[server-sessions] DON'T USE SERVER-SESSIONS PACKAGE! IT'S OUTDATED AND PROBABLY UNSAFE");
    console.error("If you want to use it for something that will never go production set LOAD_UNSAFE_SERVERSESSIONS enviroment variable to true")
}

/**
 * @deprecated Don't use this package it's not maintained
 */
class SessionExpiredError extends Error {
    constructor() {
        super("Session expired");
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * @deprecated Don't use this package it's not maintained
 */
class SessionNotFoundError extends Error {
    constructor() {
        super("Session not found");
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * @deprecated Don't use this package it's not maintained
 */
const defaultSettings = {
    expireTime: 24 * 60 * 60 * 1000,
    storagePath: './sessions.sqlite',
    renewTimestamp: 1 * 60 * 60
};
Object.freeze(defaultSettings);

/**
 * @deprecated Don't use this package it's not maintained
 */
class SessionManager {
    constructor(options, storage, model) {
        this._settings = options;
        this._storage = storage;
        this._model = model;
    }
    /**
     * Create session and return session token
     * @param data session data
     * @deprecated Don't use this package it's not maintained
     */
    async createSession(data) {
        let session = await this._model.create({
            data: stringify(data || null),
            expire: Date.now() + this._settings.expireTime
        })
        if (session)
            return session.id;
        else {
            throw new Error("Something went wrong, and I don't know what xD");
        }
    }
    /**
     * Finds session and if it's valid returns session data  
     * If session is expired throws SessionExpiredError  
     * If session doesn't exists throws SessionNotFoundError
     * @param token session token
     * @deprecated Don't use this package it's not maintained
     */
    async retrieveSession(token) {
        let session = await this._model.findOne({
            where: {
                id: token
            }
        });
        if (!session)
            throw new SessionNotFoundError();
        if (!this._validateSession(session))
            throw new SessionExpiredError();
        if (session.data) {
            let sessionData = JSON.parse(session.data);
            return sessionData;
        }
        return null;
    }
    /**
     * Updates & renews session with specified token  
     * Doesn't check if session is valid  
     * If session doesn't exists throws SessionNotFoundError
     * @param token session token
     * @param data session data
     * @deprecated Don't use this package it's not maintained
     */
    async updateSession(token, data) {
        let session = await this._model.findOne({
            where: {
                id: token
            }
        });
        if (session) {
            session.data = stringify(data || null);
            this._renewSessionInstance(session);
            await session.save();
            return data;
        } else throw new SessionNotFoundError();
    }
    /** 
     * Renews session with specified token whenever it's valid or not  
     * If session doesn't exits throws SessionNotFoundError
     * @param token session token
     * @deprecated Don't use this package it's not maintained
     */
    async renewSession(token) {
        let session = await this._model.findOne({
            where: {
                id: token
            }
        });
        if (session) {
            this._renewSessionInstance(session);
            await session.save();
            return true;
        } else throw new SessionNotFoundError();
    }
    /** 
     * Removes session with specified token  
     * If session doesn't exits do nothing, you want to delete it, so who cares if it exists? XD
     * @deprecated Don't use this package it's not maintained
     * */
    async removeSession(token) {
        await this._model.destroy({
            where: {
                id: token
            }
        });
        return true;
    }
    /**
     * Removes all expired sessions, returns amount of deleted sessions
     * @deprecated Don't use this package it's not maintained
     */
    async removeExpiredSessions() {
        let deleted = await this._model.destroy({
            where: {
                expire: {
                    [Sequelize.Op.lt]: Date.now()
                }
            }
        });
        return deleted;
    }

    /** Renews session instance, doesn't save */
    _renewSessionInstance(session) {
        //No need for renewing if session expire time is higher than renew timestamp
        if ((Date.now() - session.expire) > this._settings.renewTimestamp)
            return true;
        session.expire = Date.now() + this._settings.renewTimestamp;
        return true;
    }
    _validateSession(session) {
        return (session.expire - Date.now()) > 0;
    }
}

/**
 * 
 * @deprecated Don't use this package it's not maintained
 */
async function init(options = {}) {
    let customOptions = options;
    options = Object.assign({}, defaultSettings);
    Object.assign(options, customOptions);

    let sessionStorage = new Sequelize("mainDB", null, null, {
        dialect: "sqlite",
        storage: options.storagePath,
        logging: false
    });
    let sessionModel = sessionStorage.define('Session', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        data: {
            type: Sequelize.JSON
        },
        expire: {
            type: Sequelize.INTEGER
        }
    });
    await sessionStorage.sync({
        force: false
    });
    return new SessionManager(options, sessionStorage, sessionModel);
}

module.exports.SessionExpiredError = SessionExpiredError;
module.exports.SessionNotFoundError = SessionNotFoundError;
module.exports.init = init;