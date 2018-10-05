export enum Roles {
  user = 'user',
  admin = 'admin',
}

export interface ICurrentUser {
  id: string;
  email: string;
  roles: Roles[];
}
