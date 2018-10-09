import config from 'config';
import fetch from 'node-fetch';
import FormData from 'form-data';

import { LocalAuthService } from './LocalAuthService';

const AUTH: any = config.get('auth');

export class DevelopmentAuthService extends LocalAuthService {

  protected async verify(token: string) {
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve('true');
    }
    return Promise.resolve(undefined);
  }
}
