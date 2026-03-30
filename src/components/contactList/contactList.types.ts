export interface User {
  id: number;
  name: string;
  tag: string;
  status: string;
  photo?: string;
}

export interface Chat {
  id: number;
  type: string;
  name: string;
  tag: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarColor: string;
  avatarInitials: string;
}

export interface PendingRequest {
  id: number;
  contactId: number;
  userId: number;
  status: string;
  user?: User;
  requester?: User;
}

export type SelectableItem = {
  id: number;
  name: string;
  tag?: string;
  type: 'contact' | 'group';
};

export interface ContactListProps {
  usuarioActual: User | null;
  onSelectItem: (item: SelectableItem) => void;
}
