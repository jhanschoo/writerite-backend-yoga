import { ResTo } from '../types';

import { IUser } from './User';

export interface IAuthResponse {
  user: ResTo<IUser>;
  token: ResTo<string>;
}
