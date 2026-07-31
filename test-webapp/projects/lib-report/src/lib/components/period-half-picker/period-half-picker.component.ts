import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * components/period-half-picker/period-half-picker.component.ts
 *
 * Presentational, reusable ControlValueAccessor. Month navigation + two
 * half-month selectable options (1-15 / 16-EOM) + conditional "Rimuovi
 * selezione" clear action; writes the computed date-range string back to
 * its bound FormControl.
 *
 * AMBIGUITY-M-01 (resolved per architecture-report.md): popup shell uses
 * CdkConnectedOverlay instead of MatMenu (positioning-fidelity default).
 *
 * Replaces: togglePeriodPicker/changePeriodMonth/selectPeriodHalf/clearPeriod
 * (JS-040/041/042/043); positionFixed (JS-031, superseded by CDK Overlay).
 */
@Component({
  selector: 'lib-report-period-half-picker',
  standalone: false,
  templateUrl: './period-half-picker.component.html',
  styleUrl: './period-half-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PeriodHalfPickerComponent),
      multi: true,
    },
  ],
})
export class PeriodHalfPickerComponent implements ControlValueAccessor {
  open = false;
  disabled = false;
  value: string | null = null;

  private viewDate = new Date();

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get monthLabel(): string {
    return `${MONTH_NAMES[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  togglePicker(): void {
    if (this.disabled) {
      return;
    }
    this.open = !this.open;
    if (this.open) {
      this.onTouched();
    }
  }

  closePicker(): void {
    this.open = false;
  }

  changeMonth(delta: number): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + delta, 1);
  }

  selectHalf(half: 'first' | 'second'): void {
    const year = this.viewDate.getFullYear();
    const monthIndex = this.viewDate.getMonth();
    const monthName = MONTH_NAMES[monthIndex];
    const range =
      half === 'first'
        ? `01-15 ${monthName} ${year}`
        : `16-${lastDayOfMonth(year, monthIndex)} ${monthName} ${year}`;

    this.value = range;
    this.onChange(range);
    this.closePicker();
  }

  clear(): void {
    this.value = null;
    this.onChange(null);
    this.closePicker();
  }
}
