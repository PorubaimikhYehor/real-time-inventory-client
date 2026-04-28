import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Configuration, FormControlConfiguration, GroupControl } from '@app/shared/models/form-control-configuration';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  getControlsConfiguration(controlsConfiguration: GroupControl): FormControlConfiguration[] {
    const getConfiguration = (controlConfig: FormControlConfiguration): Configuration =>
      typeof controlConfig.configuration == 'function' ? controlConfig.configuration() : controlConfig.configuration ?? Configuration.Visible;
    return (controlsConfiguration.controls || []).filter(item => getConfiguration(item) & Configuration.Visible);
  }

  getConfiguredGroup(controlsConfiguration: GroupControl): GroupControl {
    const getConfiguration = (controlConfig: FormControlConfiguration): Configuration =>
      typeof controlConfig.configuration == 'function' ? controlConfig.configuration() : controlConfig.configuration ?? Configuration.Visible;
    controlsConfiguration.controls = (controlsConfiguration.controls || []).filter(item => getConfiguration(item) & Configuration.Visible);
    return controlsConfiguration;
  }

  addFormControls(form: FormGroup, items: FormControlConfiguration[]): void {
    items.forEach(item => {
      const control = this.createFormControl(item);
      if (!form.contains(item.name) && control) {
        form.addControl(item.name, control);

        // Sync Form -> Config (Setter)
        control.valueChanges.subscribe(value => {
          if ('value' in item) {
            item.value = value;
          }
        });
      }
    });
  }

  createFormControl(item: FormControlConfiguration): AbstractControl | undefined {
    switch (item.type) {
      case 'array':
        return new FormArray([]);
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

  getFormControl(form: FormGroup, item: FormControlConfiguration): FormControl {
    return form.get(item.name) as FormControl;
  }

  asFormControl(control: AbstractControl | undefined): FormControl {
    return control as FormControl;
  }

  asFormGroup(control: AbstractControl | undefined): FormGroup {
    return control as FormGroup;
  }

  asFormArray(control: AbstractControl | undefined): FormArray {
    return control as FormArray;
  }

  getFormArrayItems(form: FormGroup, item: FormControlConfiguration): FormArray {
    const formArray = form.get(item.name) as FormArray;
    return formArray ? formArray : new FormArray<FormGroup>([]);
  }

  addFormArrayItem(form: FormGroup, item: GroupControl): void {
    const formArray = form.get(item.name) as FormArray;
    if (formArray) {
      const formGroup = new FormGroup({});
      this.addFormControls(formGroup, item.controls || [])
      formArray.push(formGroup);
    }
  }

  removeFormArrayItem(form: FormGroup, item: GroupControl, index: number): void {
    const formArray = form.get(item.name) as FormArray;
    if (formArray) {
      formArray.removeAt(index);
    }
  }
}
