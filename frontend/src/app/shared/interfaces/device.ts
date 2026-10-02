export interface Device {
  _id: string;
  name: string;
  description?: string;
  model?: string;
  serialNumber: string;
  location?: string;
  installationDate?: string;
  online: boolean;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}