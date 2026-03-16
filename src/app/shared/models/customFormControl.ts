import { FormControl, ValidatorFn, AbstractControlOptions, FormControlState } from "@angular/forms";

export class CustomControl<T> extends FormControl {
  public metadata: { [key: string]: any };

  constructor(
    formState: T | FormControlState<T>,
    metadata: { [key: string]: any } = {},
    validatorOrOpts?: ValidatorFn | AbstractControlOptions | ValidatorFn[]
  ) {
    super(formState, validatorOrOpts);
    this.metadata = metadata;
  }
}