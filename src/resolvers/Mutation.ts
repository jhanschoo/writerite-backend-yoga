// tslint:disable-next-line:no-submodule-imports
import { IResolverObject } from "graphql-yoga/dist/types";
import { login, signup } from "./Authorization";

const Mutation: IResolverObject = {
  login,
  signup,
};

export default Mutation;
