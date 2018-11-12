import config from 'config';
import fetch from 'node-fetch';
import FormData from 'form-data';

import { prisma } from '../generated/prisma-client';
import { AbstractAuthService } from './AbstractAuthService';
import { comparePassword, hashPassword } from '../util';

const AUTH: any = config.get('auth');

export class LocalAuthService extends AbstractAuthService {

  public async signin(email: string, token: string, password: string, persist?: boolean) {
    if (await prisma.$exists.user({ email })) {
      const knownUser = await prisma.user({ email });
      if (knownUser && knownUser.passwordHash && await comparePassword(password, knownUser.passwordHash)) {
        return LocalAuthService.authResponseFromUser(knownUser, persist);
      }
      return null;
    } else {
      const verified = await this.verify(token);
      if (!verified) {
        return null;
      }
      // create
      const passwordHash = await hashPassword(password);
      const user = prisma.createUser(
        { email, passwordHash, defaultRoles: { set: ['user'] } },
      );
      return LocalAuthService.authResponseFromUser(await user, persist);
    }
  }

  protected async verify(token: string) {
    const form = new FormData();
    form.append('secret', AUTH.recaptcha_secret);
    form.append('response', token);

    return new Promise<string | undefined>((res, rej) => {
      fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'post',
        body: form,
      }).then((response) => {
        // TODO: assert that hostname is correct
        return response.json().then((json) => json.success ? res('true' as string) : res(undefined));
      }).catch((e) => res(undefined));
    });
  }
}
