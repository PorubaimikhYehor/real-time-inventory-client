import { Component, input, model } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { FormControlConfiguration, GroupControl } from '@app/shared/models/formControlConfiguration.interface';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormSelectComponent } from '../form-select/form-select.component';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, ButtonComponent, FormInputComponent, FormSelectComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  form = model<FormGroup>(new FormGroup({}));
  controlList = input<FormArray>();
  controlsConfiguration = input.required<GroupControl>();
  index = input<number>()
  cssClass = input<string>();

  ngOnInit() {
    this.addFormControls(this.form(), this.controlsConfiguration().nestedFormControls || []);
  }

  addFormControls(form: FormGroup, items: FormControlConfiguration[]): void {
    items.forEach(item => {
      const control = this.createFormControl(item);
      if (control) form.addControl(item.name, control);
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
