import config from 'config';

import { UserNode } from '../generated/prisma-client';
import { generateJWT } from '../util';

export abstract class AbstractAuthService {
  protected static async authResponseFromUser(
    user: UserNode,
    persist: boolean = false,
  ) {
    const id = user.id;
    const email = user.email;
    const roles = user.defaultRoles;
    return {
      token: generateJWT({ id, email, roles }, persist),
      user,
    };
  }

  public abstract async signin(
    email: string,
    token: string,
    identifier: string,
    persist?: boolean): Promise<any>;
  protected abstract async verify(token: string): Promise<any>;
}
