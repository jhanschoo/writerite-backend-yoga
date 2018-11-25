import { Prisma, SimpleCard as PSimpleCard } from '../../generated/prisma-client';
import { ResTo, AFunResTo } from '../types';
import { fieldGetter } from '../util';

import { IDeck, IBakedDeck, pDeckToIDeck } from './Deck';

export interface ICard {
  id: ResTo<string>;
  front: ResTo<string>;
  back: ResTo<string>;
  deck: ResTo<IDeck>;
}

// tslint:disable-next-line: variable-name
export const Card: ICard = {
  id: fieldGetter<string>('id'),
  front: fieldGetter<string>('front'),
  back: fieldGetter<string>('back'),
  deck: fieldGetter<IDeck>('deck'),
};

export interface IBakedCard extends ICard {
  id: string;
  front: string;
  back: string;
  deck: AFunResTo<IBakedDeck>;
}

// Relation resolver
export function pCardToICard(pSimpleCard: PSimpleCard, prisma: Prisma): IBakedCard {
  return {
    id: pSimpleCard.id,
    front: pSimpleCard.front,
    back: pSimpleCard.back,
    deck: async () => {
      return pDeckToIDeck(
        await prisma.simpleCard({ id: pSimpleCard.id }).deck(),
        prisma,
      );
    },
  };
}
