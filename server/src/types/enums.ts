// enums.ts
export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
}

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum FriendAction {
  SEND_REQUEST = 'send_request',
  ACCEPT_REQUEST = 'accept_request',
  REJECT_REQUEST = 'reject_request',
  CANCEL_REQUEST = 'cancel_request',
  BLOCK = 'block',
  UNBLOCK = 'unblock',
  IGNORE = 'ignore',
}
