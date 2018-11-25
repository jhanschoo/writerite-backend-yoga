import { User as PUser, Prisma } from '../../generated/prisma-client';
import { generateJWT } from '../util';
import { pUserToIUser } from '../resolver/User';
import { IAuthResponse } from '../resolver/Authorization';

export interface ISigninOptions {
  prisma: Prisma;
  email: string;
  token: string;
  identifier: string;
  persist?: boolean;
}

export abstract class AbstractAuthService {
  protected static async authResponseFromUser(
    pUser: PUser, { persist = false, prisma }: {
      persist?: boolean,
      prisma: Prisma,
    },
  ): Promise<IAuthResponse> {
    const user = pUserToIUser(pUser, prisma);
    return {
      token: generateJWT({
        id: pUser.id,
        email: pUser.email,
        roles: pUser.defaultRoles,
      }, persist),
      user,
    };
  }

  public abstract async signin({
    prisma, email, token, identifier, persist,
  }: ISigninOptions): Promise<any>;
  protected abstract async verify(token: string): Promise<any>;
}
