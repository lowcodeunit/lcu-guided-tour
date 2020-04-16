export type MessageType = 'BOT' | 'USER' | 'CUSTOM';

export class ChatMessage {
  message: string;
  type?: MessageType = 'BOT';

  constructor(opts: ChatMessage) {
    Object.assign(this, opts);
  }
}
