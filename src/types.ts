export type ResolvesTo<T> = ((parent: any) => Promise<T>)|((parent: any) => T)|T;

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

export interface IUpdate<T> {
  mutation: MutationType;
  new: T|null;
  old: T|null;
}
