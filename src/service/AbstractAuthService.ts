import config from 'config';

import { UserNode } from '../generated/prisma-client';
import { generateJWT } from '../util';
import { userNodeToIUser } from '../resolver/User';
import { IAuthResponse } from '../resolver/Authorization';

export abstract class AbstractAuthService {
  protected static async authResponseFromUser(
    userNode: UserNode,
    persist: boolean = false,
  ): Promise<IAuthResponse> {
    const user = userNodeToIUser(userNode);
    return {
      token: generateJWT({
        id: userNode.id,
        email: userNode.email,
        roles: userNode.defaultRoles,
      }, persist),
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
