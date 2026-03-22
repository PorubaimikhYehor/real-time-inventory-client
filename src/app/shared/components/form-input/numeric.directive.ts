import { Directive, HostListener, ElementRef, input, booleanAttribute, inject } from '@angular/core';

@Directive({
  selector: '[appNumeric]',
  standalone: true
})
export class NumericDirective {
  appNumeric = input(true, { transform: booleanAttribute });

  private regex = /^-?(?:\d+[.,]?\d*|[.,]\d+)(?:[eE][+-]?\d*)?$/;
  private exceptions = ['-', '.', '-.', ''];
  private specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
  private el = inject(ElementRef<HTMLInputElement>);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.appNumeric() || this.specialKeys.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (event.key === ',' && this.isThousandSeparator()) {
      event.preventDefault();
      return;
    }

    const next = this.getNextValue(event.key === ',' ? '.' : event.key);

    if (!this.exceptions.includes(next) && !this.regex.test(next)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!this.appNumeric()) return;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(',', '.');
    const next = this.getNextValue(pasted);
    
    if (!this.exceptions.includes(next) && !this.regex.test(next)) {
      event.preventDefault();
    }
  }

  private getNextValue(inserted: string): string {
    const input = this.el.nativeElement;
    return [
      input.value.slice(0, input.selectionStart ?? 0),
      inserted,
      input.value.slice(input.selectionEnd ?? 0)
    ].join('');
  }

  private isThousandSeparator(): boolean {
    return (1.1).toLocaleString().substring(1, 2) !== ',';
  }
}