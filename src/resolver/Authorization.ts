import { GraphQLFieldResolver } from 'graphql';

import { GoogleAuthService } from '../service/GoogleAuthService';
import { FacebookAuthService } from '../service/FacebookAuthService';
import { LocalAuthService } from '../service/LocalAuthService';
import { DevelopmentAuthService } from '../service/DevelopmentAuthService';
import { AuthorizerType, ResolvesTo } from '../types';
import { IUser } from './User';
import { IFieldResolver } from 'graphql-tools';

const googleAuth = new GoogleAuthService();
const facebookAuth = new FacebookAuthService();
const localAuth = new LocalAuthService();
const developmentAuth = new DevelopmentAuthService();

export interface IAuthResponse {
  user: ResolvesTo<IUser>;
  token: ResolvesTo<string>;
}

const signin: IFieldResolver<any, any, {
  email: string,
  token: string,
  authorizer: string,
  identifier: string,
  persist?: boolean,
}> = async (
  parent,
  { email, token, authorizer, identifier, persist },
): Promise<IAuthResponse | null> => {
  if (authorizer === AuthorizerType.LOCAL) {
    return localAuth.signin(email, token, identifier, persist);
  }
  if (authorizer === AuthorizerType.GOOGLE) {
    return googleAuth.signin(email, token, identifier, persist);
  }
  if (authorizer === AuthorizerType.FACEBOOK) {
    return facebookAuth.signin(email, token, identifier, persist);
  }
  if (authorizer === AuthorizerType.DEVELOPMENT) {
    return developmentAuth.signin(email, token, identifier, persist);
  }
  return null;
}

export const authorizationMutation = {
  signin,
};
