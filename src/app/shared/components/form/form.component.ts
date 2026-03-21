import { Component, inject, input, model, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { FormControlConfiguration, GroupControl } from '@app/shared/models/formControlConfiguration.interface';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormSelectComponent } from '../form-select/form-select.component';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, ButtonComponent, FormInputComponent, FormSelectComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  form = model<FormGroup>(new FormGroup({}));
  controlList = input<AbstractControl[]>();
  controlsConfiguration = input.required<GroupControl>();
  index = input<number>()
  onSubmit = input();
  cssClass = input<string>();



  ngOnInit() {
    this.addFormControls(this.form(), this.controlsConfiguration().nestedFormControls || []);
  }

  getFormControl(form: FormGroup, item: FormControlConfiguration, index?: number): FormControl {
    // if (item.type == 'array') {
    //   const array = form.get(item.name) as FormArray;
    //   return array.at(index || 0).get('name') as FormControl;
    // }
    // else {
    return form.get(item.name) as FormControl;
    // }
  }


  addFormControls(form: FormGroup, items: FormControlConfiguration[]): void {
    items.forEach(item => form.addControl(item.name, this.createFormControl(item)))
  }

  asFormControl(control: AbstractControl | undefined): FormControl {
    return control as FormControl;
  }

  asFormGroup(control: AbstractControl | undefined): FormGroup {
    return control as FormGroup;
  }

  createFormControl(item: FormControlConfiguration): AbstractControl {
    if (item.type == 'array') {
      return new FormArray([])
    }
    else if (item.type == 'group') {
      const formGroup = new FormGroup({});
      this.addFormControls(formGroup, item.nestedFormControls || [])
      return formGroup;
    }
    else {
      const formControl = new FormControl()
      formControl.setValidators(item.validators || [])
      return formControl;
    }
  }

  addFormArrayItem(form: FormGroup, item: GroupControl): void {
    const formArray = form.get(item.name) as FormArray;
    const formGroup = new FormGroup({});
    this.addFormControls(formGroup, item.nestedFormControls || [])
    formArray.push(formGroup);
  }

  getFormArrayItems(form: FormGroup, item: FormControlConfiguration) {
    const formArray = form.get(item.name) as FormArray;
    return formArray ? formArray.controls : [];
  }
}
