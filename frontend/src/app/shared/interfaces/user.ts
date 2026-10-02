import { Timestamps } from "./general";
export interface User extends Timestamps {
  _id: string;
  name: string;
  about?: string;
  email: string;
}