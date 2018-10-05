// tslint:disable-next-line:no-submodule-imports
import { IResolverObject } from 'graphql-yoga/dist/types';
import { roomSubscription } from './Room';

const Subscription: IResolverObject = {
  ...roomSubscription,
};

export default Subscription;
