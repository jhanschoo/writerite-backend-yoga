import { Prisma, PSimpleCard } from '../../generated/prisma-client';
import { ResTo, AFunResTo } from '../types';
import { fieldGetter } from '../util';

import { IRwDeck, IBakedRwDeck, pDeckToRwDeck } from './RwDeck';

export interface IRwCard {
  id: ResTo<string>;
  front: ResTo<string>;
  back: ResTo<string>;
  deck: ResTo<IRwDeck>;
}

// tslint:disable-next-line: variable-name
export const RwCard: IRwCard = {
  id: fieldGetter<string>('id'),
  front: fieldGetter<string>('front'),
  back: fieldGetter<string>('back'),
  deck: fieldGetter<IRwDeck>('deck'),
};

export interface IBakedRwCard extends IRwCard {
  id: string;
  front: string;
  back: string;
  deck: AFunResTo<IBakedRwDeck>;
}

// Relation resolver
export function pCardToRwCard(pSimpleCard: PSimpleCard, prisma: Prisma): IBakedRwCard {
  return {
    id: pSimpleCard.id,
    front: pSimpleCard.front,
    back: pSimpleCard.back,
    deck: async () => {
      return pDeckToRwDeck(
        await prisma.pSimpleCard({ id: pSimpleCard.id }).deck(),
        prisma,
      );
    },
  };
}
