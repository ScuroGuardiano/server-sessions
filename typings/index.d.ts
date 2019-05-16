import * as Sequelize from 'sequelize';

declare module 'server-sessions' {
    export class SessionExpiredError extends Error {
        public constructor();
    }
    export class SessionNotFoundError extends Error {
        public constructor();
    }
    export interface ISessionAttributes {
        id?: string;
        data?: string;
        expire: number;
        createdAt?: string;
        updatedAt?: string;
    }

    export interface ISessionManagerOptions {
        /** After how many miliseconds session is expired, default 24h */
        expireTime?: number;
        /** Path to storage db, default "./session.sqlite" */
        storagePath?: string;
        /** After how many miliseconds session is expired after session renew, default 1h */
        renewTimestamp?: number;
    }
    export class SessionManager<T = any> {
        private constructor(options: ISessionManagerOptions, storage: Sequelize.Sequelize, model: any);
        /**
        * Create session and return session token
        * @param data session data
        */
        public createSession(data?: T): Promise<string>;
        /**
        * Finds session and if it's valid returns session data
        * If session is expired throws SessionExpiredError
        * If session doesn't exists throws SessionNotFoundError
        * @param token session token
        */
        public retrieveSession(token: string): Promise<T>;
        /**
        * Updates & renews session with specified token
        * Doesn't check if session is valid
        * If session doesn't exists throws SessionNotFoundError
        * @param token session token
        * @param data session data
        */
        public updateSession(token: string, data?: T): Promise<T>;
        /**
        * Renews session with specified token whenever it's valid or not
        * If session doesn't exits throws SessionNotFoundError
        * @param token session token
        */
        public renewSession(token: string): Promise<boolean>;
        /**
        * Removes session with specified token
        * If session doesn't exits do nothing, you want to delete it, so who cares if it exists? XD
        * */
        public removeSession(token: string): Promise<boolean>;
        /**
        * Removes all expired sessions, returns amount of deleted sessions
        */
        public removeExpiredSessions(): Promise<number>;
        private _renewSessionInstance(session: any): boolean;
        private _validateSession(session: any): boolean;

        private _settings: ISessionManagerOptions;
        private _model: any;
        private _storage: Sequelize.Sequelize;
    }
    export function init<T = any>(options?: ISessionManagerOptions): Promise<SessionManager<T>>;
}
