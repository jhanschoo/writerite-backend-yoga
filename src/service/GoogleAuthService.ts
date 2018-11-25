import config from 'config';
import { OAuth2Client } from 'google-auth-library';

import { AbstractAuthService, ISigninOptions } from './AbstractAuthService';

const AUTH: any = config.get('auth');

const googleClient = new OAuth2Client(AUTH.google_client_id);

export class GoogleAuthService extends AbstractAuthService {

  public async signin({ prisma, email, token, identifier, persist }: ISigninOptions) {
    const googleId = await this.verify(token);
    if (!googleId || googleId !== identifier) {
      return null;
    }
    if (await prisma.$exists.user({ email })) {
      if (!await prisma.$exists.user({ email, googleId })) {
        return null;
      }
      return GoogleAuthService.authResponseFromUser(
        await prisma.user({ email }), { persist, prisma },
      );
    }
    const pUser = await prisma.createUser(
      { email, googleId, defaultRoles: { set: ['user'] } },
    );
    return GoogleAuthService.authResponseFromUser(pUser, { persist, prisma });
  }

  protected async verify(idToken: string) {
    return new Promise<string | undefined>((res, rej) => {
      googleClient.verifyIdToken({
        audience: AUTH.google_client_id,
        idToken,
      }).then((ticket) => {
        if (!ticket || ticket === null) {
          res(undefined);
          return;
        }
        const payload = ticket.getPayload();
        if (!payload) {
          res(undefined);
          return;
        }
        res(payload.sub);
      }).catch((e) => res(undefined));
    });
  }
}
