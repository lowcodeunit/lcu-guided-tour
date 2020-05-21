export class GuidedTourStepRecord {
  public CurrentStep: string;
  public StepHistory: string[];

  constructor(opts: GuidedTourStepRecord) {
    Object.assign(this, opts);
  }
}
