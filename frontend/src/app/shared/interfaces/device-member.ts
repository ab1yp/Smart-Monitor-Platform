import { Role } from "./general";
export interface DeviceMember {
  _id: string;
  role: Role;
  userId: string;
  createdById: string;
  deviceId: string;
  joinedAt: string;
}