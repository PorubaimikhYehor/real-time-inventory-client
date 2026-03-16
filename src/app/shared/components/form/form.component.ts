import { Component, inject, input, model, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { CustomControl } from '@app/shared/models/customFormControl';
import { FormControlConfiguration, FormControlConfigurationType } from '@app/shared/models/formControlConfiguration.interface';
import { FormInputComponent } from '../form-input/form-input.component';
@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, ButtonComponent, FormInputComponent],
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
    console.log(this.form());
    console.log(this.controlsConfiguration());
  }

  addFormControls(from: FormGroup, controlsConfiguration: FormControlConfiguration[]): void {
    controlsConfiguration.forEach(item => {
      if (item.type == FormControlConfigurationType.array) {
        from.addControl(item.name, new FormArray([]));
      }
      else {
        item.formControl = new FormControl();
        item.inputType = signal<'number' | 'string'>('number');
        from.addControl(item.name, item.formControl);
      }
    });
  }




  getCustomControl = (controlName: string) => this.form().get(controlName) as CustomControl<any>;

}
