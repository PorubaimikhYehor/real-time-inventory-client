import { AbstractControl, FormArray, FormControl, ValidatorFn, Validators } from "@angular/forms";
import { FormInputType } from "../components/form-input/form-input.component";
import { Signal } from "@angular/core";
import { SelectOption } from "../components/form-select/form-select.component";


export interface FormControlConfiguration {
  name: string;
  // formControl: AbstractControl;
  type: 'array' | 'text' | 'select' | 'number' | 'button',
  validators?: ValidatorFn[];
  label?: string;
  placeholder?: string,
  inputType?: FormInputType,
  options?: Signal<SelectOption[]> | SelectOption[]; // for select type
  nestedFormControls?: FormControlConfiguration[];
  variant?: 'primary' | 'secondary' | 'destructive'; // for button type
  callback?: (opt?: any) => void | string; // for button type
  icon?: string;

}