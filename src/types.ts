import { ContextParameters } from 'graphql-yoga/dist/types';
import { Prisma } from '../generated/prisma-client';
import { PubSub } from 'graphql-yoga';

export type AFunResTo<T> = ((parent: any) => Promise<T>);
export type FunResTo<T> = ((parent: any) => T);

export type ResTo<T> =
  | AFunResTo<T>
  | FunResTo<T>
  | T;

export interface IRwContext {
  req: ContextParameters;
  sub?: ICurrentUser;
  prisma: Prisma;
  pubsub: PubSub;
}

export enum AuthorizerType {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  LOCAL = 'LOCAL',
  DEVELOPMENT = 'DEVELOPMENT',
}

export enum MutationType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export enum Roles {
  user = 'user',
  admin = 'admin',
}

export interface ICurrentUser {
  id: string;
  email: string;
  roles: Roles[];
}

export interface IUpdate<T, M = MutationType> {
  mutation: M;
  new: T | null;
  oldId: string | null;
}

export interface IAuthConfig {
  GOOGLE_CLIENT_ID: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  RECAPTCHA_SECRET: string;
}

export interface IHttpsConfig {
  CERT_FILE: string;
  KEY_FILE: string;
}
