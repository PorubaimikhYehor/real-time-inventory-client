import { Component, effect, input, model, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { Configuration, FormControlConfiguration, GroupControl } from '@app/shared/models/form-control-configuration';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormSelectComponent } from '../form-select/form-select.component';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, ButtonComponent, FormInputComponent, FormSelectComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  initialValues = input<any>();
  form = model<FormGroup>(new FormGroup({}));
  controlList = input<FormArray>();
  controlsConfiguration = input.required<GroupControl>();
  index = input<number>();
  controls = signal<FormControlConfiguration[]>([]);
  localForm = signal<FormGroup>(new FormGroup({}));

  getControlsConfiguration(controlsConfiguration: GroupControl): FormControlConfiguration[] {
    return (controlsConfiguration.nestedFormControls || [])
      .filter(item => (typeof item.configuration == 'function' ? item.configuration() : item.configuration ?? Configuration.Visible) & Configuration.Visible);
  }


  constructor() {
    effect(() => {
      const config = this.getControlsConfiguration(this.controlsConfiguration());
      this.addFormControls(this.form(), config);
      this.controls.set(config);
    });

    effect(() => {
      const values = this.initialValues();
      const controlsConfiguration = this.controlsConfiguration();
      if (values) {
        this.form().patchValue(values);
      }
      controlsConfiguration.nestedFormControls?.forEach(controlConfig => {
        const control = this.form().get(controlConfig.name);
        const arrayValues = values ? values[controlConfig.name] : null;
        if (control instanceof FormArray && Array.isArray(arrayValues)) {
          arrayValues.forEach(value => {
            const arrayFormGroup = new FormGroup({});
            control.push(arrayFormGroup);
            this.addFormControls(arrayFormGroup, (controlConfig as GroupControl).nestedFormControls || []);
            arrayFormGroup.patchValue(value);
          });
        }
      });
    });
  }


  addFormControls(form: FormGroup, items: FormControlConfiguration[]): void {
    items.forEach(item => {
      const control = this.createFormControl(item);
      if (!form.contains(item.name) && control) { // Check if it exists first
        form.addControl(item.name, control);
      }
    });
  }

  createFormControl(item: FormControlConfiguration): AbstractControl | undefined {
    switch (item.type) {
      case 'array':
        return new FormArray([]);
      case 'group':
        const formGroup = new FormGroup({});
        this.addFormControls(formGroup, item.nestedFormControls || [])
        return formGroup;
      case 'select':
      case 'text':
      case 'number':
        const formControl = new FormControl();
        formControl.setValidators(item.validators || [])
        return formControl;
      default:
        return;
    }
  }

  getFormControl(form: FormGroup, item: FormControlConfiguration, index?: number): FormControl {
    return form.get(item.name) as FormControl;
  }

  asFormControl(control: AbstractControl | undefined): FormControl {
    return control as FormControl;
  }

  asFormGroup(control: AbstractControl | undefined): FormGroup {
    return control as FormGroup;
  }

  asFormArray(control: AbstractControl): FormArray {
    return control as FormArray;
  }

  getFormArrayItems(form: FormGroup, item: FormControlConfiguration): FormArray {
    const formArray = form.get(item.name) as FormArray;
    return formArray ? formArray : new FormArray<FormGroup>([]);
  }

  addFormArrayItem(form: FormGroup, item: GroupControl): void {
    const formArray = form.get(item.name) as FormArray;
    const formGroup = new FormGroup({});
    this.addFormControls(formGroup, item.nestedFormControls || [])
    formArray.push(formGroup);
  }
  removeFormArrayItem(form: FormGroup, item: GroupControl, index: number): void {
    const formArray = form.get(item.name) as FormArray;
    formArray.removeAt(index);
  }
}
