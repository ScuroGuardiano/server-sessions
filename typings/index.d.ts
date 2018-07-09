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

    export type ISessionInstance = Sequelize.Instance<ISessionAttributes> & ISessionAttributes;

    export interface ISessionManagerOptions {
        /** After how many miliseconds session is expired, default 24h */
        expireTime?: number;
        /** Path to storage db, default "./session.sqlite" */
        storagePath?: string;
        /** After how many miliseconds session is expired after session renew, default 1h */
        renewTimestamp?: number;
    }
    export class SessionManager<T = any> {
        private constructor(options: ISessionManagerOptions, storage: Sequelize.Sequelize, model: Sequelize.Model<ISessionInstance, ISessionAttributes>);
        public createSession(data?: T): Promise<string>;
        public retrieveSession(token: string): Promise<T>;
        public updateSession(token: string, data?: T): Promise<T>;
        public renewSession(token: string): Promise<boolean>;
        public removeSession(token: string): Promise<boolean>;
        public removeExpiredSessions(): Promise<number>;
        private _renewSessionInstance(session: ISessionInstance): boolean;
        private _validateSession(session: ISessionInstance): boolean;

        private _settings: ISessionManagerOptions;
        private _model: Sequelize.Model<ISessionInstance, ISessionAttributes>
        private _storage: Sequelize.Sequelize;
    }
    export function init<T = any>(options?: ISessionManagerOptions): Promise<SessionManager<T>>;
}
