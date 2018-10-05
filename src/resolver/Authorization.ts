import { GraphQLFieldResolver } from 'graphql';

import { GoogleAuthService } from '../service/GoogleAuthService';
import { FacebookAuthService } from '../service/FacebookAuthService';
import { LocalAuthService } from '../service/LocalAuthService';

const googleAuth = new GoogleAuthService();
const facebookAuth = new FacebookAuthService();
const localAuth = new LocalAuthService();

const signin: GraphQLFieldResolver<any, any> = async (
  parent,
  { email, token, authorizer, identifier, persist },
) => {
  if (authorizer === 'LOCAL') {
    return localAuth.signin(email, token, identifier, persist);
  }
  if (authorizer === 'GOOGLE') {
    return googleAuth.signin(email, token, identifier, persist);
  }
  if (authorizer === 'FACEBOOK') {
    return facebookAuth.signin(email, token, identifier, persist);
  }
  return null;
};

export const authorizationMutation = {
  signin,
};
