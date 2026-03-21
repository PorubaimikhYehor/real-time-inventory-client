import { AsyncValidatorFn, ValidatorFn } from "@angular/forms";
import { Signal } from "@angular/core";
import { SelectOption } from "../components/form-select/form-select.component";
type OneOrMore<T> = T | T[];


export type BaseControl = {
  name: string;
  label?: string;
  labelCssClass?: string;
  placeholder?: string;
  validators?: OneOrMore<ValidatorFn> | OneOrMore<AsyncValidatorFn>;
  cssClass?: string;
};

export type TextControl = BaseControl & {
  type: 'text' | 'number';
};

export type ButtonControl = BaseControl & {
  type: 'button';
  variant?: 'primary' | 'secondary' | 'destructive';
  callback?: (opt?: any) => void | string;
  icon?: string;
  disabled?: Signal<boolean> | boolean;
};

export type SelectControl = BaseControl & {
  type: 'select';
  options: Signal<SelectOption[]> | SelectOption[];
};

export type GroupControl = BaseControl & {
  type: 'group' | 'array';
  nestedFormControls: FormControlConfiguration[];
};

export type FormControlConfiguration = | TextControl | ButtonControl | SelectControl | GroupControl;