import { AsyncValidatorFn, ValidatorFn } from "@angular/forms";
import { Signal } from "@angular/core";
import { SelectOption } from "@app/components/form-select/form-select.component";
type OneOrMore<T> = T | T[];


export type BaseControl = {
  name: string;
  label?: string;
  labelCssClass?: string;
  placeholder?: string;
  validators?: OneOrMore<ValidatorFn> | OneOrMore<AsyncValidatorFn>;
  cssClass?: string;
  configuration?: Signal<Configuration> | Configuration;
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
  controls: FormControlConfiguration[];
};

export enum Configuration {
  Hidden = 1 << 0,
  Visible = 1 << 1,
  Required = 1 << 2,
  Optional = 1 << 3,
  Readonly = 1 << 4,
  Editable = 1 << 5
}

export const DEFAULT_CONTROL_CONFIG = Configuration.Visible | Configuration.Optional | Configuration.Editable;

export type FormControlConfiguration = TextControl | ButtonControl | SelectControl | GroupControl;