import config from 'config';
import fetch from 'node-fetch';
import FormData from 'form-data';

import { comparePassword, hashPassword } from '../util';
import { AbstractAuthService, ISigninOptions } from './AbstractAuthService';
import { IAuthConfig } from '../types';

const { RECAPTCHA_SECRET } = config.get<IAuthConfig>('AUTH');

export class LocalAuthService extends AbstractAuthService {

  public async signin({ prisma, email, token, identifier: password, persist }: ISigninOptions) {
    if (await prisma.$exists.pUser({ email })) {
      const knownUser = await prisma.pUser({ email });
      if (!knownUser || !knownUser.passwordHash || !await comparePassword(password, knownUser.passwordHash)) {
        return null;
      }
      return LocalAuthService.authResponseFromUser(knownUser, { persist, prisma });
    }
    const verified = await this.verify(token);
    if (!verified) {
      return null;
    }
    // create
    const passwordHash = await hashPassword(password);
    const user = prisma.createPUser(
      { email, passwordHash, defaultRoles: { set: ['user'] } },
    );
    return LocalAuthService.authResponseFromUser(await user, { persist, prisma });
  }

  protected async verify(token: string) {
    const form = new FormData();
    form.append('secret', RECAPTCHA_SECRET);
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
