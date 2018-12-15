export const typeDefs = /* GraphQL */ `type AggregateDeck {
  count: Int!
}

type AggregateRoom {
  count: Int!
}

type AggregateSimpleCard {
  count: Int!
}

type AggregateSimpleUserRoomMessage {
  count: Int!
}

type AggregateUser {
  count: Int!
}

type BatchPayload {
  count: Long!
}

type Deck {
  id: ID!
  name: String!
  owner: User!
  cards(where: SimpleCardWhereInput, orderBy: SimpleCardOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [SimpleCard!]
  published: Boolean!
}

type DeckConnection {
  pageInfo: PageInfo!
  edges: [DeckEdge]!
  aggregate: AggregateDeck!
}

input DeckCreateInput {
  name: String!
  owner: UserCreateOneWithoutDecksInput!
  cards: SimpleCardCreateManyWithoutDeckInput
  published: Boolean
}

input DeckCreateManyWithoutOwnerInput {
  create: [DeckCreateWithoutOwnerInput!]
  connect: [DeckWhereUniqueInput!]
}

input DeckCreateOneWithoutCardsInput {
  create: DeckCreateWithoutCardsInput
  connect: DeckWhereUniqueInput
}

input DeckCreateWithoutCardsInput {
  name: String!
  owner: UserCreateOneWithoutDecksInput!
  published: Boolean
}

input DeckCreateWithoutOwnerInput {
  name: String!
  cards: SimpleCardCreateManyWithoutDeckInput
  published: Boolean
}

type DeckEdge {
  node: Deck!
  cursor: String!
}

enum DeckOrderByInput {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  published_ASC
  published_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type DeckPreviousValues {
  id: ID!
  name: String!
  published: Boolean!
}

input DeckScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  published: Boolean
  published_not: Boolean
  AND: [DeckScalarWhereInput!]
  OR: [DeckScalarWhereInput!]
  NOT: [DeckScalarWhereInput!]
}

type DeckSubscriptionPayload {
  mutation: MutationType!
  node: Deck
  updatedFields: [String!]
  previousValues: DeckPreviousValues
}

input DeckSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: DeckWhereInput
  AND: [DeckSubscriptionWhereInput!]
  OR: [DeckSubscriptionWhereInput!]
  NOT: [DeckSubscriptionWhereInput!]
}

input DeckUpdateInput {
  name: String
  owner: UserUpdateOneRequiredWithoutDecksInput
  cards: SimpleCardUpdateManyWithoutDeckInput
  published: Boolean
}

input DeckUpdateManyDataInput {
  name: String
  published: Boolean
}

input DeckUpdateManyMutationInput {
  name: String
  published: Boolean
}

input DeckUpdateManyWithoutOwnerInput {
  create: [DeckCreateWithoutOwnerInput!]
  delete: [DeckWhereUniqueInput!]
  connect: [DeckWhereUniqueInput!]
  disconnect: [DeckWhereUniqueInput!]
  update: [DeckUpdateWithWhereUniqueWithoutOwnerInput!]
  upsert: [DeckUpsertWithWhereUniqueWithoutOwnerInput!]
  deleteMany: [DeckScalarWhereInput!]
  updateMany: [DeckUpdateManyWithWhereNestedInput!]
}

input DeckUpdateManyWithWhereNestedInput {
  where: DeckScalarWhereInput!
  data: DeckUpdateManyDataInput!
}

input DeckUpdateOneRequiredWithoutCardsInput {
  create: DeckCreateWithoutCardsInput
  update: DeckUpdateWithoutCardsDataInput
  upsert: DeckUpsertWithoutCardsInput
  connect: DeckWhereUniqueInput
}

input DeckUpdateWithoutCardsDataInput {
  name: String
  owner: UserUpdateOneRequiredWithoutDecksInput
  published: Boolean
}

input DeckUpdateWithoutOwnerDataInput {
  name: String
  cards: SimpleCardUpdateManyWithoutDeckInput
  published: Boolean
}

input DeckUpdateWithWhereUniqueWithoutOwnerInput {
  where: DeckWhereUniqueInput!
  data: DeckUpdateWithoutOwnerDataInput!
}

input DeckUpsertWithoutCardsInput {
  update: DeckUpdateWithoutCardsDataInput!
  create: DeckCreateWithoutCardsInput!
}

input DeckUpsertWithWhereUniqueWithoutOwnerInput {
  where: DeckWhereUniqueInput!
  update: DeckUpdateWithoutOwnerDataInput!
  create: DeckCreateWithoutOwnerInput!
}

input DeckWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  owner: UserWhereInput
  cards_every: SimpleCardWhereInput
  cards_some: SimpleCardWhereInput
  cards_none: SimpleCardWhereInput
  published: Boolean
  published_not: Boolean
  AND: [DeckWhereInput!]
  OR: [DeckWhereInput!]
  NOT: [DeckWhereInput!]
}

input DeckWhereUniqueInput {
  id: ID
}

scalar Long

type Mutation {
  createDeck(data: DeckCreateInput!): Deck!
  updateDeck(data: DeckUpdateInput!, where: DeckWhereUniqueInput!): Deck
  updateManyDecks(data: DeckUpdateManyMutationInput!, where: DeckWhereInput): BatchPayload!
  upsertDeck(where: DeckWhereUniqueInput!, create: DeckCreateInput!, update: DeckUpdateInput!): Deck!
  deleteDeck(where: DeckWhereUniqueInput!): Deck
  deleteManyDecks(where: DeckWhereInput): BatchPayload!
  createRoom(data: RoomCreateInput!): Room!
  updateRoom(data: RoomUpdateInput!, where: RoomWhereUniqueInput!): Room
  updateManyRooms(data: RoomUpdateManyMutationInput!, where: RoomWhereInput): BatchPayload!
  upsertRoom(where: RoomWhereUniqueInput!, create: RoomCreateInput!, update: RoomUpdateInput!): Room!
  deleteRoom(where: RoomWhereUniqueInput!): Room
  deleteManyRooms(where: RoomWhereInput): BatchPayload!
  createSimpleCard(data: SimpleCardCreateInput!): SimpleCard!
  updateSimpleCard(data: SimpleCardUpdateInput!, where: SimpleCardWhereUniqueInput!): SimpleCard
  updateManySimpleCards(data: SimpleCardUpdateManyMutationInput!, where: SimpleCardWhereInput): BatchPayload!
  upsertSimpleCard(where: SimpleCardWhereUniqueInput!, create: SimpleCardCreateInput!, update: SimpleCardUpdateInput!): SimpleCard!
  deleteSimpleCard(where: SimpleCardWhereUniqueInput!): SimpleCard
  deleteManySimpleCards(where: SimpleCardWhereInput): BatchPayload!
  createSimpleUserRoomMessage(data: SimpleUserRoomMessageCreateInput!): SimpleUserRoomMessage!
  updateSimpleUserRoomMessage(data: SimpleUserRoomMessageUpdateInput!, where: SimpleUserRoomMessageWhereUniqueInput!): SimpleUserRoomMessage
  updateManySimpleUserRoomMessages(data: SimpleUserRoomMessageUpdateManyMutationInput!, where: SimpleUserRoomMessageWhereInput): BatchPayload!
  upsertSimpleUserRoomMessage(where: SimpleUserRoomMessageWhereUniqueInput!, create: SimpleUserRoomMessageCreateInput!, update: SimpleUserRoomMessageUpdateInput!): SimpleUserRoomMessage!
  deleteSimpleUserRoomMessage(where: SimpleUserRoomMessageWhereUniqueInput!): SimpleUserRoomMessage
  deleteManySimpleUserRoomMessages(where: SimpleUserRoomMessageWhereInput): BatchPayload!
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  updateManyUsers(data: UserUpdateManyMutationInput!, where: UserWhereInput): BatchPayload!
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  deleteUser(where: UserWhereUniqueInput!): User
  deleteManyUsers(where: UserWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

interface Node {
  id: ID!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  deck(where: DeckWhereUniqueInput!): Deck
  decks(where: DeckWhereInput, orderBy: DeckOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Deck]!
  decksConnection(where: DeckWhereInput, orderBy: DeckOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): DeckConnection!
  room(where: RoomWhereUniqueInput!): Room
  rooms(where: RoomWhereInput, orderBy: RoomOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Room]!
  roomsConnection(where: RoomWhereInput, orderBy: RoomOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): RoomConnection!
  simpleCard(where: SimpleCardWhereUniqueInput!): SimpleCard
  simpleCards(where: SimpleCardWhereInput, orderBy: SimpleCardOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [SimpleCard]!
  simpleCardsConnection(where: SimpleCardWhereInput, orderBy: SimpleCardOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): SimpleCardConnection!
  simpleUserRoomMessage(where: SimpleUserRoomMessageWhereUniqueInput!): SimpleUserRoomMessage
  simpleUserRoomMessages(where: SimpleUserRoomMessageWhereInput, orderBy: SimpleUserRoomMessageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [SimpleUserRoomMessage]!
  simpleUserRoomMessagesConnection(where: SimpleUserRoomMessageWhereInput, orderBy: SimpleUserRoomMessageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): SimpleUserRoomMessageConnection!
  user(where: UserWhereUniqueInput!): User
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!
  node(id: ID!): Node
}

type Room {
  id: ID!
  name: String!
  owner: User!
  occupants(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User!]
  messages(where: SimpleUserRoomMessageWhereInput, orderBy: SimpleUserRoomMessageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [SimpleUserRoomMessage!]
  active: Boolean!
}

type RoomConnection {
  pageInfo: PageInfo!
  edges: [RoomEdge]!
  aggregate: AggregateRoom!
}

input RoomCreateInput {
  name: String!
  owner: UserCreateOneWithoutOwnerOfRoomInput!
  occupants: UserCreateManyWithoutOccupyingRoomInput
  messages: SimpleUserRoomMessageCreateManyWithoutRoomInput
  active: Boolean!
}

input RoomCreateManyWithoutOccupantsInput {
  create: [RoomCreateWithoutOccupantsInput!]
  connect: [RoomWhereUniqueInput!]
}

input RoomCreateManyWithoutOwnerInput {
  create: [RoomCreateWithoutOwnerInput!]
  connect: [RoomWhereUniqueInput!]
}

input RoomCreateOneWithoutMessagesInput {
  create: RoomCreateWithoutMessagesInput
  connect: RoomWhereUniqueInput
}

input RoomCreateWithoutMessagesInput {
  name: String!
  owner: UserCreateOneWithoutOwnerOfRoomInput!
  occupants: UserCreateManyWithoutOccupyingRoomInput
  active: Boolean!
}

input RoomCreateWithoutOccupantsInput {
  name: String!
  owner: UserCreateOneWithoutOwnerOfRoomInput!
  messages: SimpleUserRoomMessageCreateManyWithoutRoomInput
  active: Boolean!
}

input RoomCreateWithoutOwnerInput {
  name: String!
  occupants: UserCreateManyWithoutOccupyingRoomInput
  messages: SimpleUserRoomMessageCreateManyWithoutRoomInput
  active: Boolean!
}

type RoomEdge {
  node: Room!
  cursor: String!
}

enum RoomOrderByInput {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  active_ASC
  active_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type RoomPreviousValues {
  id: ID!
  name: String!
  active: Boolean!
}

input RoomScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  active: Boolean
  active_not: Boolean
  AND: [RoomScalarWhereInput!]
  OR: [RoomScalarWhereInput!]
  NOT: [RoomScalarWhereInput!]
}

type RoomSubscriptionPayload {
  mutation: MutationType!
  node: Room
  updatedFields: [String!]
  previousValues: RoomPreviousValues
}

input RoomSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: RoomWhereInput
  AND: [RoomSubscriptionWhereInput!]
  OR: [RoomSubscriptionWhereInput!]
  NOT: [RoomSubscriptionWhereInput!]
}

input RoomUpdateInput {
  name: String
  owner: UserUpdateOneRequiredWithoutOwnerOfRoomInput
  occupants: UserUpdateManyWithoutOccupyingRoomInput
  messages: SimpleUserRoomMessageUpdateManyWithoutRoomInput
  active: Boolean
}

input RoomUpdateManyDataInput {
  name: String
  active: Boolean
}

input RoomUpdateManyMutationInput {
  name: String
  active: Boolean
}

input RoomUpdateManyWithoutOccupantsInput {
  create: [RoomCreateWithoutOccupantsInput!]
  delete: [RoomWhereUniqueInput!]
  connect: [RoomWhereUniqueInput!]
  disconnect: [RoomWhereUniqueInput!]
  update: [RoomUpdateWithWhereUniqueWithoutOccupantsInput!]
  upsert: [RoomUpsertWithWhereUniqueWithoutOccupantsInput!]
  deleteMany: [RoomScalarWhereInput!]
  updateMany: [RoomUpdateManyWithWhereNestedInput!]
}

input RoomUpdateManyWithoutOwnerInput {
  create: [RoomCreateWithoutOwnerInput!]
  delete: [RoomWhereUniqueInput!]
  connect: [RoomWhereUniqueInput!]
  disconnect: [RoomWhereUniqueInput!]
  update: [RoomUpdateWithWhereUniqueWithoutOwnerInput!]
  upsert: [RoomUpsertWithWhereUniqueWithoutOwnerInput!]
  deleteMany: [RoomScalarWhereInput!]
  updateMany: [RoomUpdateManyWithWhereNestedInput!]
}

input RoomUpdateManyWithWhereNestedInput {
  where: RoomScalarWhereInput!
  data: RoomUpdateManyDataInput!
}

input RoomUpdateOneRequiredWithoutMessagesInput {
  create: RoomCreateWithoutMessagesInput
  update: RoomUpdateWithoutMessagesDataInput
  upsert: RoomUpsertWithoutMessagesInput
  connect: RoomWhereUniqueInput
}

input RoomUpdateWithoutMessagesDataInput {
  name: String
  owner: UserUpdateOneRequiredWithoutOwnerOfRoomInput
  occupants: UserUpdateManyWithoutOccupyingRoomInput
  active: Boolean
}

input RoomUpdateWithoutOccupantsDataInput {
  name: String
  owner: UserUpdateOneRequiredWithoutOwnerOfRoomInput
  messages: SimpleUserRoomMessageUpdateManyWithoutRoomInput
  active: Boolean
}

input RoomUpdateWithoutOwnerDataInput {
  name: String
  occupants: UserUpdateManyWithoutOccupyingRoomInput
  messages: SimpleUserRoomMessageUpdateManyWithoutRoomInput
  active: Boolean
}

input RoomUpdateWithWhereUniqueWithoutOccupantsInput {
  where: RoomWhereUniqueInput!
  data: RoomUpdateWithoutOccupantsDataInput!
}

input RoomUpdateWithWhereUniqueWithoutOwnerInput {
  where: RoomWhereUniqueInput!
  data: RoomUpdateWithoutOwnerDataInput!
}

input RoomUpsertWithoutMessagesInput {
  update: RoomUpdateWithoutMessagesDataInput!
  create: RoomCreateWithoutMessagesInput!
}

input RoomUpsertWithWhereUniqueWithoutOccupantsInput {
  where: RoomWhereUniqueInput!
  update: RoomUpdateWithoutOccupantsDataInput!
  create: RoomCreateWithoutOccupantsInput!
}

input RoomUpsertWithWhereUniqueWithoutOwnerInput {
  where: RoomWhereUniqueInput!
  update: RoomUpdateWithoutOwnerDataInput!
  create: RoomCreateWithoutOwnerInput!
}

input RoomWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  owner: UserWhereInput
  occupants_every: UserWhereInput
  occupants_some: UserWhereInput
  occupants_none: UserWhereInput
  messages_every: SimpleUserRoomMessageWhereInput
  messages_some: SimpleUserRoomMessageWhereInput
  messages_none: SimpleUserRoomMessageWhereInput
  active: Boolean
  active_not: Boolean
  AND: [RoomWhereInput!]
  OR: [RoomWhereInput!]
  NOT: [RoomWhereInput!]
}

input RoomWhereUniqueInput {
  id: ID
}

type SimpleCard {
  id: ID!
  deck: Deck!
  front: String!
  back: String!
}

type SimpleCardConnection {
  pageInfo: PageInfo!
  edges: [SimpleCardEdge]!
  aggregate: AggregateSimpleCard!
}

input SimpleCardCreateInput {
  deck: DeckCreateOneWithoutCardsInput!
  front: String!
  back: String!
}

input SimpleCardCreateManyWithoutDeckInput {
  create: [SimpleCardCreateWithoutDeckInput!]
  connect: [SimpleCardWhereUniqueInput!]
}

input SimpleCardCreateWithoutDeckInput {
  front: String!
  back: String!
}

type SimpleCardEdge {
  node: SimpleCard!
  cursor: String!
}

enum SimpleCardOrderByInput {
  id_ASC
  id_DESC
  front_ASC
  front_DESC
  back_ASC
  back_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type SimpleCardPreviousValues {
  id: ID!
  front: String!
  back: String!
}

input SimpleCardScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  front: String
  front_not: String
  front_in: [String!]
  front_not_in: [String!]
  front_lt: String
  front_lte: String
  front_gt: String
  front_gte: String
  front_contains: String
  front_not_contains: String
  front_starts_with: String
  front_not_starts_with: String
  front_ends_with: String
  front_not_ends_with: String
  back: String
  back_not: String
  back_in: [String!]
  back_not_in: [String!]
  back_lt: String
  back_lte: String
  back_gt: String
  back_gte: String
  back_contains: String
  back_not_contains: String
  back_starts_with: String
  back_not_starts_with: String
  back_ends_with: String
  back_not_ends_with: String
  AND: [SimpleCardScalarWhereInput!]
  OR: [SimpleCardScalarWhereInput!]
  NOT: [SimpleCardScalarWhereInput!]
}

type SimpleCardSubscriptionPayload {
  mutation: MutationType!
  node: SimpleCard
  updatedFields: [String!]
  previousValues: SimpleCardPreviousValues
}

input SimpleCardSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: SimpleCardWhereInput
  AND: [SimpleCardSubscriptionWhereInput!]
  OR: [SimpleCardSubscriptionWhereInput!]
  NOT: [SimpleCardSubscriptionWhereInput!]
}

input SimpleCardUpdateInput {
  deck: DeckUpdateOneRequiredWithoutCardsInput
  front: String
  back: String
}

input SimpleCardUpdateManyDataInput {
  front: String
  back: String
}

input SimpleCardUpdateManyMutationInput {
  front: String
  back: String
}

input SimpleCardUpdateManyWithoutDeckInput {
  create: [SimpleCardCreateWithoutDeckInput!]
  delete: [SimpleCardWhereUniqueInput!]
  connect: [SimpleCardWhereUniqueInput!]
  disconnect: [SimpleCardWhereUniqueInput!]
  update: [SimpleCardUpdateWithWhereUniqueWithoutDeckInput!]
  upsert: [SimpleCardUpsertWithWhereUniqueWithoutDeckInput!]
  deleteMany: [SimpleCardScalarWhereInput!]
  updateMany: [SimpleCardUpdateManyWithWhereNestedInput!]
}

input SimpleCardUpdateManyWithWhereNestedInput {
  where: SimpleCardScalarWhereInput!
  data: SimpleCardUpdateManyDataInput!
}

input SimpleCardUpdateWithoutDeckDataInput {
  front: String
  back: String
}

input SimpleCardUpdateWithWhereUniqueWithoutDeckInput {
  where: SimpleCardWhereUniqueInput!
  data: SimpleCardUpdateWithoutDeckDataInput!
}

input SimpleCardUpsertWithWhereUniqueWithoutDeckInput {
  where: SimpleCardWhereUniqueInput!
  update: SimpleCardUpdateWithoutDeckDataInput!
  create: SimpleCardCreateWithoutDeckInput!
}

input SimpleCardWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  deck: DeckWhereInput
  front: String
  front_not: String
  front_in: [String!]
  front_not_in: [String!]
  front_lt: String
  front_lte: String
  front_gt: String
  front_gte: String
  front_contains: String
  front_not_contains: String
  front_starts_with: String
  front_not_starts_with: String
  front_ends_with: String
  front_not_ends_with: String
  back: String
  back_not: String
  back_in: [String!]
  back_not_in: [String!]
  back_lt: String
  back_lte: String
  back_gt: String
  back_gte: String
  back_contains: String
  back_not_contains: String
  back_starts_with: String
  back_not_starts_with: String
  back_ends_with: String
  back_not_ends_with: String
  AND: [SimpleCardWhereInput!]
  OR: [SimpleCardWhereInput!]
  NOT: [SimpleCardWhereInput!]
}

input SimpleCardWhereUniqueInput {
  id: ID
}

type SimpleUserRoomMessage {
  id: ID!
  room: Room!
  sender: User!
  content: String!
}

type SimpleUserRoomMessageConnection {
  pageInfo: PageInfo!
  edges: [SimpleUserRoomMessageEdge]!
  aggregate: AggregateSimpleUserRoomMessage!
}

input SimpleUserRoomMessageCreateInput {
  room: RoomCreateOneWithoutMessagesInput!
  sender: UserCreateOneInput!
  content: String!
}

input SimpleUserRoomMessageCreateManyWithoutRoomInput {
  create: [SimpleUserRoomMessageCreateWithoutRoomInput!]
  connect: [SimpleUserRoomMessageWhereUniqueInput!]
}

input SimpleUserRoomMessageCreateWithoutRoomInput {
  sender: UserCreateOneInput!
  content: String!
}

type SimpleUserRoomMessageEdge {
  node: SimpleUserRoomMessage!
  cursor: String!
}

enum SimpleUserRoomMessageOrderByInput {
  id_ASC
  id_DESC
  content_ASC
  content_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type SimpleUserRoomMessagePreviousValues {
  id: ID!
  content: String!
}

input SimpleUserRoomMessageScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  content: String
  content_not: String
  content_in: [String!]
  content_not_in: [String!]
  content_lt: String
  content_lte: String
  content_gt: String
  content_gte: String
  content_contains: String
  content_not_contains: String
  content_starts_with: String
  content_not_starts_with: String
  content_ends_with: String
  content_not_ends_with: String
  AND: [SimpleUserRoomMessageScalarWhereInput!]
  OR: [SimpleUserRoomMessageScalarWhereInput!]
  NOT: [SimpleUserRoomMessageScalarWhereInput!]
}

type SimpleUserRoomMessageSubscriptionPayload {
  mutation: MutationType!
  node: SimpleUserRoomMessage
  updatedFields: [String!]
  previousValues: SimpleUserRoomMessagePreviousValues
}

input SimpleUserRoomMessageSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: SimpleUserRoomMessageWhereInput
  AND: [SimpleUserRoomMessageSubscriptionWhereInput!]
  OR: [SimpleUserRoomMessageSubscriptionWhereInput!]
  NOT: [SimpleUserRoomMessageSubscriptionWhereInput!]
}

input SimpleUserRoomMessageUpdateInput {
  room: RoomUpdateOneRequiredWithoutMessagesInput
  sender: UserUpdateOneRequiredInput
  content: String
}

input SimpleUserRoomMessageUpdateManyDataInput {
  content: String
}

input SimpleUserRoomMessageUpdateManyMutationInput {
  content: String
}

input SimpleUserRoomMessageUpdateManyWithoutRoomInput {
  create: [SimpleUserRoomMessageCreateWithoutRoomInput!]
  delete: [SimpleUserRoomMessageWhereUniqueInput!]
  connect: [SimpleUserRoomMessageWhereUniqueInput!]
  disconnect: [SimpleUserRoomMessageWhereUniqueInput!]
  update: [SimpleUserRoomMessageUpdateWithWhereUniqueWithoutRoomInput!]
  upsert: [SimpleUserRoomMessageUpsertWithWhereUniqueWithoutRoomInput!]
  deleteMany: [SimpleUserRoomMessageScalarWhereInput!]
  updateMany: [SimpleUserRoomMessageUpdateManyWithWhereNestedInput!]
}

input SimpleUserRoomMessageUpdateManyWithWhereNestedInput {
  where: SimpleUserRoomMessageScalarWhereInput!
  data: SimpleUserRoomMessageUpdateManyDataInput!
}

input SimpleUserRoomMessageUpdateWithoutRoomDataInput {
  sender: UserUpdateOneRequiredInput
  content: String
}

input SimpleUserRoomMessageUpdateWithWhereUniqueWithoutRoomInput {
  where: SimpleUserRoomMessageWhereUniqueInput!
  data: SimpleUserRoomMessageUpdateWithoutRoomDataInput!
}

input SimpleUserRoomMessageUpsertWithWhereUniqueWithoutRoomInput {
  where: SimpleUserRoomMessageWhereUniqueInput!
  update: SimpleUserRoomMessageUpdateWithoutRoomDataInput!
  create: SimpleUserRoomMessageCreateWithoutRoomInput!
}

input SimpleUserRoomMessageWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  room: RoomWhereInput
  sender: UserWhereInput
  content: String
  content_not: String
  content_in: [String!]
  content_not_in: [String!]
  content_lt: String
  content_lte: String
  content_gt: String
  content_gte: String
  content_contains: String
  content_not_contains: String
  content_starts_with: String
  content_not_starts_with: String
  content_ends_with: String
  content_not_ends_with: String
  AND: [SimpleUserRoomMessageWhereInput!]
  OR: [SimpleUserRoomMessageWhereInput!]
  NOT: [SimpleUserRoomMessageWhereInput!]
}

input SimpleUserRoomMessageWhereUniqueInput {
  id: ID
}

type Subscription {
  deck(where: DeckSubscriptionWhereInput): DeckSubscriptionPayload
  room(where: RoomSubscriptionWhereInput): RoomSubscriptionPayload
  simpleCard(where: SimpleCardSubscriptionWhereInput): SimpleCardSubscriptionPayload
  simpleUserRoomMessage(where: SimpleUserRoomMessageSubscriptionWhereInput): SimpleUserRoomMessageSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}

type User {
  id: ID!
  email: String!
  passwordHash: String
  googleId: String
  facebookId: String
  decks(where: DeckWhereInput, orderBy: DeckOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Deck!]
  defaultRoles: [String!]!
  ownerOfRoom(where: RoomWhereInput, orderBy: RoomOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Room!]
  occupyingRoom(where: RoomWhereInput, orderBy: RoomOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Room!]
}

type UserConnection {
  pageInfo: PageInfo!
  edges: [UserEdge]!
  aggregate: AggregateUser!
}

input UserCreatedefaultRolesInput {
  set: [String!]
}

input UserCreateInput {
  email: String!
  passwordHash: String
  googleId: String
  facebookId: String
  decks: DeckCreateManyWithoutOwnerInput
  defaultRoles: UserCreatedefaultRolesInput
  ownerOfRoom: RoomCreateManyWithoutOwnerInput
  occupyingRoom: RoomCreateManyWithoutOccupantsInput
}

input UserCreateManyWithoutOccupyingRoomInput {
  create: [UserCreateWithoutOccupyingRoomInput!]
  connect: [UserWhereUniqueInput!]
}

input UserCreateOneInput {
  create: UserCreateInput
  connect: UserWhereUniqueInput
}

input UserCreateOneWithoutDecksInput {
  create: UserCreateWithoutDecksInput
  connect: UserWhereUniqueInput
}

input UserCreateOneWithoutOwnerOfRoomInput {
  create: UserCreateWithoutOwnerOfRoomInput
  connect: UserWhereUniqueInput
}

input UserCreateWithoutDecksInput {
  email: String!
  passwordHash: String
  googleId: String
  facebookId: String
  defaultRoles: UserCreatedefaultRolesInput
  ownerOfRoom: RoomCreateManyWithoutOwnerInput
  occupyingRoom: RoomCreateManyWithoutOccupantsInput
}

input UserCreateWithoutOccupyingRoomInput {
  email: String!
  passwordHash: String
  googleId: String
  facebookId: String
  decks: DeckCreateManyWithoutOwnerInput
  defaultRoles: UserCreatedefaultRolesInput
  ownerOfRoom: RoomCreateManyWithoutOwnerInput
}

input UserCreateWithoutOwnerOfRoomInput {
  email: String!
  passwordHash: String
  googleId: String
  facebookId: String
  decks: DeckCreateManyWithoutOwnerInput
  defaultRoles: UserCreatedefaultRolesInput
  occupyingRoom: RoomCreateManyWithoutOccupantsInput
}

type UserEdge {
  node: User!
  cursor: String!
}

enum UserOrderByInput {
  id_ASC
  id_DESC
  email_ASC
  email_DESC
  passwordHash_ASC
  passwordHash_DESC
  googleId_ASC
  googleId_DESC
  facebookId_ASC
  facebookId_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type UserPreviousValues {
  id: ID!
  email: String!
  passwordHash: String
  googleId: String
  facebookId: String
  defaultRoles: [String!]!
}

input UserScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  email: String
  email_not: String
  email_in: [String!]
  email_not_in: [String!]
  email_lt: String
  email_lte: String
  email_gt: String
  email_gte: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  passwordHash: String
  passwordHash_not: String
  passwordHash_in: [String!]
  passwordHash_not_in: [String!]
  passwordHash_lt: String
  passwordHash_lte: String
  passwordHash_gt: String
  passwordHash_gte: String
  passwordHash_contains: String
  passwordHash_not_contains: String
  passwordHash_starts_with: String
  passwordHash_not_starts_with: String
  passwordHash_ends_with: String
  passwordHash_not_ends_with: String
  googleId: String
  googleId_not: String
  googleId_in: [String!]
  googleId_not_in: [String!]
  googleId_lt: String
  googleId_lte: String
  googleId_gt: String
  googleId_gte: String
  googleId_contains: String
  googleId_not_contains: String
  googleId_starts_with: String
  googleId_not_starts_with: String
  googleId_ends_with: String
  googleId_not_ends_with: String
  facebookId: String
  facebookId_not: String
  facebookId_in: [String!]
  facebookId_not_in: [String!]
  facebookId_lt: String
  facebookId_lte: String
  facebookId_gt: String
  facebookId_gte: String
  facebookId_contains: String
  facebookId_not_contains: String
  facebookId_starts_with: String
  facebookId_not_starts_with: String
  facebookId_ends_with: String
  facebookId_not_ends_with: String
  AND: [UserScalarWhereInput!]
  OR: [UserScalarWhereInput!]
  NOT: [UserScalarWhereInput!]
}

type UserSubscriptionPayload {
  mutation: MutationType!
  node: User
  updatedFields: [String!]
  previousValues: UserPreviousValues
}

input UserSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: UserWhereInput
  AND: [UserSubscriptionWhereInput!]
  OR: [UserSubscriptionWhereInput!]
  NOT: [UserSubscriptionWhereInput!]
}

input UserUpdateDataInput {
  email: String
  passwordHash: String
  googleId: String
  facebookId: String
  decks: DeckUpdateManyWithoutOwnerInput
  defaultRoles: UserUpdatedefaultRolesInput
  ownerOfRoom: RoomUpdateManyWithoutOwnerInput
  occupyingRoom: RoomUpdateManyWithoutOccupantsInput
}

input UserUpdatedefaultRolesInput {
  set: [String!]
}

input UserUpdateInput {
  email: String
  passwordHash: String
  googleId: String
  facebookId: String
  decks: DeckUpdateManyWithoutOwnerInput
  defaultRoles: UserUpdatedefaultRolesInput
  ownerOfRoom: RoomUpdateManyWithoutOwnerInput
  occupyingRoom: RoomUpdateManyWithoutOccupantsInput
}

input UserUpdateManyDataInput {
  email: String
  passwordHash: String
  googleId: String
  facebookId: String
  defaultRoles: UserUpdatedefaultRolesInput
}

input UserUpdateManyMutationInput {
  email: String
  passwordHash: String
  googleId: String
  facebookId: String
  defaultRoles: UserUpdatedefaultRolesInput
}

input UserUpdateManyWithoutOccupyingRoomInput {
  create: [UserCreateWithoutOccupyingRoomInput!]
  delete: [UserWhereUniqueInput!]
  connect: [UserWhereUniqueInput!]
  disconnect: [UserWhereUniqueInput!]
  update: [UserUpdateWithWhereUniqueWithoutOccupyingRoomInput!]
  upsert: [UserUpsertWithWhereUniqueWithoutOccupyingRoomInput!]
  deleteMany: [UserScalarWhereInput!]
  updateMany: [UserUpdateManyWithWhereNestedInput!]
}

input UserUpdateManyWithWhereNestedInput {
  where: UserScalarWhereInput!
  data: UserUpdateManyDataInput!
}

input UserUpdateOneRequiredInput {
  create: UserCreateInput
  update: UserUpdateDataInput
  upsert: UserUpsertNestedInput
  connect: UserWhereUniqueInput
}

input UserUpdateOneRequiredWithoutDecksInput {
  create: UserCreateWithoutDecksInput
  update: UserUpdateWithoutDecksDataInput
  upsert: UserUpsertWithoutDecksInput
  connect: UserWhereUniqueInput
}

input UserUpdateOneRequiredWithoutOwnerOfRoomInput {
  create: UserCreateWithoutOwnerOfRoomInput
  update: UserUpdateWithoutOwnerOfRoomDataInput
  upsert: UserUpsertWithoutOwnerOfRoomInput
  connect: UserWhereUniqueInput
}

input UserUpdateWithoutDecksDataInput {
  email: String
  passwordHash: String
  googleId: String
  facebookId: String
  defaultRoles: UserUpdatedefaultRolesInput
  ownerOfRoom: RoomUpdateManyWithoutOwnerInput
  occupyingRoom: RoomUpdateManyWithoutOccupantsInput
}

input UserUpdateWithoutOccupyingRoomDataInput {
  email: String
  passwordHash: String
  googleId: String
  facebookId: String
  decks: DeckUpdateManyWithoutOwnerInput
  defaultRoles: UserUpdatedefaultRolesInput
  ownerOfRoom: RoomUpdateManyWithoutOwnerInput
}

input UserUpdateWithoutOwnerOfRoomDataInput {
  email: String
  passwordHash: String
  googleId: String
  facebookId: String
  decks: DeckUpdateManyWithoutOwnerInput
  defaultRoles: UserUpdatedefaultRolesInput
  occupyingRoom: RoomUpdateManyWithoutOccupantsInput
}

input UserUpdateWithWhereUniqueWithoutOccupyingRoomInput {
  where: UserWhereUniqueInput!
  data: UserUpdateWithoutOccupyingRoomDataInput!
}

input UserUpsertNestedInput {
  update: UserUpdateDataInput!
  create: UserCreateInput!
}

input UserUpsertWithoutDecksInput {
  update: UserUpdateWithoutDecksDataInput!
  create: UserCreateWithoutDecksInput!
}

input UserUpsertWithoutOwnerOfRoomInput {
  update: UserUpdateWithoutOwnerOfRoomDataInput!
  create: UserCreateWithoutOwnerOfRoomInput!
}

input UserUpsertWithWhereUniqueWithoutOccupyingRoomInput {
  where: UserWhereUniqueInput!
  update: UserUpdateWithoutOccupyingRoomDataInput!
  create: UserCreateWithoutOccupyingRoomInput!
}

input UserWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  email: String
  email_not: String
  email_in: [String!]
  email_not_in: [String!]
  email_lt: String
  email_lte: String
  email_gt: String
  email_gte: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  passwordHash: String
  passwordHash_not: String
  passwordHash_in: [String!]
  passwordHash_not_in: [String!]
  passwordHash_lt: String
  passwordHash_lte: String
  passwordHash_gt: String
  passwordHash_gte: String
  passwordHash_contains: String
  passwordHash_not_contains: String
  passwordHash_starts_with: String
  passwordHash_not_starts_with: String
  passwordHash_ends_with: String
  passwordHash_not_ends_with: String
  googleId: String
  googleId_not: String
  googleId_in: [String!]
  googleId_not_in: [String!]
  googleId_lt: String
  googleId_lte: String
  googleId_gt: String
  googleId_gte: String
  googleId_contains: String
  googleId_not_contains: String
  googleId_starts_with: String
  googleId_not_starts_with: String
  googleId_ends_with: String
  googleId_not_ends_with: String
  facebookId: String
  facebookId_not: String
  facebookId_in: [String!]
  facebookId_not_in: [String!]
  facebookId_lt: String
  facebookId_lte: String
  facebookId_gt: String
  facebookId_gte: String
  facebookId_contains: String
  facebookId_not_contains: String
  facebookId_starts_with: String
  facebookId_not_starts_with: String
  facebookId_ends_with: String
  facebookId_not_ends_with: String
  decks_every: DeckWhereInput
  decks_some: DeckWhereInput
  decks_none: DeckWhereInput
  ownerOfRoom_every: RoomWhereInput
  ownerOfRoom_some: RoomWhereInput
  ownerOfRoom_none: RoomWhereInput
  occupyingRoom_every: RoomWhereInput
  occupyingRoom_some: RoomWhereInput
  occupyingRoom_none: RoomWhereInput
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
}

input UserWhereUniqueInput {
  id: ID
  email: String
}
`