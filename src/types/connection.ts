
export enum ConnectionType {
  TELEGRAM = "telegram",
  FACEBOOK = "facebook",
  INSTAGRAM = "instagram",
  TWITTER = "twitter"
}

export interface Connection {
  id: string;
  name: string;
  type: ConnectionType;
  url: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}
