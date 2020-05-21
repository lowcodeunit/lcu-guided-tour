export class ChatTourButton {
  Label: string;
  Lookup: string;
  OpenAction?: () => void;

  constructor(args: ChatTourButton) {
    Object.assign(this, args);
  }
}
