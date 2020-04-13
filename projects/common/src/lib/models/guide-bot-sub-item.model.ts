export class GuideBotSubItem {
  label: string;
  icon: string;
  action: () => void;

  constructor(args: GuideBotSubItem) {
    Object.assign(this, args);
  }
}
