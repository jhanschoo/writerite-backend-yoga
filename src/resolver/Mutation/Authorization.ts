import { IFieldResolver } from 'graphql-tools';

import { AuthorizerType, ResTo, IWrContext } from '../../types';

import { IRwAuthResponse } from '../Authorization';

import { GoogleAuthService } from '../../service/GoogleAuthService';
import { FacebookAuthService } from '../../service/FacebookAuthService';
import { LocalAuthService } from '../../service/LocalAuthService';
import { DevelopmentAuthService } from '../../service/DevelopmentAuthService';

const googleAuth = new GoogleAuthService();
const facebookAuth = new FacebookAuthService();
const localAuth = new LocalAuthService();
const developmentAuth = new DevelopmentAuthService();

const signin: IFieldResolver<any, IWrContext, {
  email: string,
  token: string,
  authorizer: string,
  identifier: string,
  persist?: boolean,
}> = async (
  _parent,
  { email, token, authorizer, identifier, persist },
  { prisma },
): Promise<IRwAuthResponse | null> => {
  if (authorizer === AuthorizerType.LOCAL) {
    return localAuth.signin({
      prisma, email, token, identifier, persist,
    });
  }
  if (authorizer === AuthorizerType.GOOGLE) {
    return googleAuth.signin({
      prisma, email, token, identifier, persist,
    });
  }
  if (authorizer === AuthorizerType.FACEBOOK) {
    return facebookAuth.signin({
      prisma, email, token, identifier, persist,
    });
  }
  if (authorizer === AuthorizerType.DEVELOPMENT) {
    return developmentAuth.signin({
      prisma, email, token, identifier, persist,
    });
  }
  return null;
};

export const authorizationMutation = {
  signin,
};
