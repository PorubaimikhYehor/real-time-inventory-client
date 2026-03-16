import { FormControl, Validators } from "@angular/forms";

export interface FormControlConfiguration {
  name: string;
  label?: string;
  placeholder?: string,
  type: FormControlConfigurationType,
  inputType: ,
  options?: [];
  validators?: Validators[];
  nestedFormControls?: FormControlConfiguration[];
  formControl: FormControl;
}

export enum FormControlConfigurationType {
  "array" = "array",
  "text" = "text",
  "select" = "select",
  "number" = "number",
  "string" = "string",
  "button" = "button"
}