import config from 'config';
import fetch from 'node-fetch';

import { AbstractAuthService, ISigninOptions } from './AbstractAuthService';
import { IAuthConfig } from '../types';

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = config.get<IAuthConfig>('AUTH');
let FB_ACCESS_TOKEN = 'FB_ACCESS_TOKEN not set!';

const FB_ACCESS_TOKEN_QUERY = `https://graph.facebook.com/oauth/access_token?client_id=${
  FACEBOOK_APP_ID
  }&client_secret=${
  FACEBOOK_APP_SECRET
  }&grant_type=client_credentials`;

fetch(FB_ACCESS_TOKEN_QUERY).then((response) => {
  response.json().then((json) => {
    FB_ACCESS_TOKEN = json.access_token;
  });
});

export class FacebookAuthService extends AbstractAuthService {

  public async signin({ prisma, email, token, identifier, persist }: ISigninOptions) {
    const facebookId = await this.verify(token);
    if (!facebookId || facebookId !== identifier) {
      return null;
    }
    if (await prisma.$exists.user({ email })) {
      if (await prisma.$exists.user({ email, facebookId })) {
        return FacebookAuthService.authResponseFromUser(
          await prisma.user({ email }), { persist, prisma },
        );
      } else {
        return null;
      }
    }
    const user = await prisma.createUser(
      { email, facebookId, defaultRoles: { set: ['user'] } },
    );
    return FacebookAuthService.authResponseFromUser(user, { persist, prisma });
  }

  protected async verify(token: string) {
    const VERIFY_URL = `https://graph.facebook.com/debug_token?input_token=${
      token
      }&access_token=${FB_ACCESS_TOKEN}`;

    return new Promise<string | undefined>((res, rej) => {
      fetch(VERIFY_URL).then((response) => {
        return response.json().then((json) => {
          if (json.data && json.data.app_id === FACEBOOK_APP_ID && json.data.is_valid) {
            return res(json.data.user_id as string);
          } else {
            return res(undefined);
          }
        }).catch((e) => res(undefined));
      }).catch((e) => res(undefined));
    });
  }
}
