import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControlConfiguration, GroupControl } from '@app/shared/models/form-control-configuration';
import { FormSelectComponent, ButtonComponent, FormInputComponent, FormService } from '@app/components';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, ButtonComponent, FormInputComponent, FormSelectComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  initialValues = input<any>();
  form = model<FormGroup>(new FormGroup({}));
  controlsConfiguration = input.required<GroupControl>();
  showLabel = input(true);

  formService = inject(FormService);

  groupConfig = computed<GroupControl>(() => this.formService.getConfiguredGroup(this.controlsConfiguration()));
  localForm = signal<FormGroup>(new FormGroup({}));

  constructor() {
    effect(() => {
      this.form().addControl(this.controlsConfiguration().name, this.localForm());
      this.addFormControls(this.localForm(), this.groupConfig().controls || []);
    });

    effect(() => {
      const values = this.initialValues();
      const controlsConfiguration = this.controlsConfiguration();
      if (values) {
        this.localForm().patchValue(values);
      }
      controlsConfiguration.controls?.forEach(controlConfig => {
        const control = this.localForm().get(controlConfig.name);
        const arrayValues = values ? values[controlConfig.name] : null;
        if (control instanceof FormArray && Array.isArray(arrayValues)) {
          arrayValues.forEach(value => {
            const arrayFormGroup = new FormGroup({});
            control.push(arrayFormGroup);
            this.addFormControls(arrayFormGroup, (controlConfig as GroupControl).controls || []);
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
    this.addFormControls(formGroup, item.controls || [])
    formArray.push(formGroup);
  }

  removeFormArrayItem(form: FormGroup, item: GroupControl, index: number): void {
    const formArray = form.get(item.name) as FormArray;
    formArray.removeAt(index);
  }
}
