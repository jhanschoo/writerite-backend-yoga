import config from 'config';
import fetch from 'node-fetch';

import { prisma } from '../generated/prisma-client';
import { AbstractAuthService } from './AbstractAuthService';

const AUTH: any = config.get('auth');
let FB_ACCESS_TOKEN = 'FB_ACCESS_TOKEN not set!';

const FB_ACCESS_TOKEN_QUERY = `https://graph.facebook.com/oauth/access_token?client_id=${
  AUTH.facebook_app_id
}&client_secret=${
  AUTH.facebook_app_secret
}&grant_type=client_credentials`;

fetch(FB_ACCESS_TOKEN_QUERY).then((response) => {
  response.json().then((json) => {
    FB_ACCESS_TOKEN = json.access_token;
  });
});

export class FacebookAuthService extends AbstractAuthService {

  public async signin(email: string, token: string, identifier: string, persist?: boolean) {
    const facebookId = await this.verify(token);
    if (!facebookId || facebookId !== identifier) {
      return null;
    }
    if (await prisma.$exists.user({ email })) {
      if (await prisma.$exists.user({ email, facebookId })) {
        return FacebookAuthService.authResponseFromUser(await prisma.user({ email }), persist);
      } else {
        return null;
      }
    }
    const user = await prisma.createUser(
      { email, facebookId, defaultRoles: { set: ['user'] } },
    );
    return FacebookAuthService.authResponseFromUser(user, persist);
  }

  protected async verify(token: string) {
    const VERIFY_URL = `https://graph.facebook.com/debug_token?input_token=${token
    }&access_token=${FB_ACCESS_TOKEN}`;

    return new Promise<string|undefined>((res, rej) => {
      fetch(VERIFY_URL).then((response) => {
        return response.json().then((json) => {
          if (json.data && json.data.app_id === AUTH.facebook_app_id && json.data.is_valid) {
            return res(json.data.user_id as string);
          } else {
            return res(undefined);
          }
        }).catch((e) => res(undefined));
      }).catch((e) => res(undefined));
    });
  }
}
