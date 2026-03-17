import { Component, inject, input, model, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { CustomControl } from '@app/shared/models/customFormControl';
import { FormControlConfiguration } from '@app/shared/models/formControlConfiguration.interface';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormSelectComponent } from '../form-select/form-select.component';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, ButtonComponent, FormInputComponent, FormSelectComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  // private fb = inject(FormBuilder);
  form = model<FormGroup>(new FormGroup({}));
  controlsConfiguration = input.required<FormControlConfiguration[]>();
  onSubmit = input();

  constructor() {
    // console.log(this.form());
  }

  ngOnInit() {
    this.addFormControls(this.form(), this.controlsConfiguration());
  }

  addFormControls(from: FormGroup, controlsConfiguration: FormControlConfiguration[]): void {
    controlsConfiguration.forEach(item => {
      if (item.type == 'array') {
        from.addControl(item.name, new FormArray([]));
      }
      else {
        item.formControl = new FormControl();
        item.inputType = item.inputType || (item.type === 'number' ? 'number' : 'text');
        item.validators?.forEach(validator => item.formControl.addValidators(validator));
        from.addControl(item.name, item.formControl);
      }
    });
  }


  getFormArrayItems(controlName: string) {
    console.log('getFormArrayItems called');
    // return [];
    const formArray = this.form().get(controlName) as unknown as FormArray;
    console.log('FormArray for control', controlName, formArray);
    return formArray ? formArray.controls : [];

  }

}
