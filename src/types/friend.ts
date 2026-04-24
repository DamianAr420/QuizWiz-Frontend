export interface Friend {
  id: number;
  name: string;
  isOnline: boolean;
}

export interface FriendRequest {
  senderId: number;
  senderName: string;
}
