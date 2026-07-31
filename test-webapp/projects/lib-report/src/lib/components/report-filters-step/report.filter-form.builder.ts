import { signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfigForm, DynamicFormBuilder, TYPE_CONTROL_FORM } from 'pl-dynamicform';

import { CascadingClient, ReportFilterConfig } from '../../index.models';

export function buildReportFilterForm(
  filters: ReportFilterConfig[],
  cascadingData: CascadingClient[],
  existingControls: Record<string, FormControl>
): ConfigForm {
  const builder = DynamicFormBuilder.create({}).addGroup('', ['row', 'g-0']);

  for (const filter of filters) {
    const fc = existingControls[filter.id] ?? new FormControl(null);

    switch (filter.type) {
      case 'text':
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.TEXT, formControl: fc, class: ['col-6', 'filter-col'] });
        break;

      case 'date':
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.DATA, formControl: fc, class: ['col-6', 'filter-col'] });
        break;

      case 'periodo':
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.DATARANGE, formControl: fc, class: ['col-6', 'filter-col'] });
        break;

      case 'select': {
        const opts = signal((filter.options ?? []).map(o => ({ id: o.value, description: o.label })));
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.COMBO, formControl: fc, options: opts, multiple: false, resetButton: false, class: ['col-6', 'filter-col'], keyCombo: { keyId: 'id', keyDescription: 'description' } });
        break;
      }

      case 'multiselect': {
        const opts = signal((filter.options ?? []).map(o => ({ id: o.value, description: o.label })));
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.COMBO, formControl: fc, options: opts, multiple: true, resetButton: false, class: ['col-6', 'filter-col'], keyCombo: { keyId: 'id', keyDescription: 'description' } });
        break;
      }

      case 'cascade-cliente': {
        const opts = signal(cascadingData.map(c => ({ id: c.id, description: c.label })));
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.COMBO, formControl: fc, options: opts, multiple: false, resetButton: false, class: ['col-6', 'filter-col'], keyCombo: { keyId: 'id', keyDescription: 'description' } });
        break;
      }

      case 'cascade-commessa': {
        const commessaOpts = signal<{ id: string; description: string }[]>([]);
        const commessaFc = existingControls[filter.id] ?? new FormControl({ value: null, disabled: true });
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.COMBO, formControl: commessaFc, options: commessaOpts, multiple: false, resetButton: false, class: ['col-6', 'filter-col'], keyCombo: { keyId: 'id', keyDescription: 'description' } });
        if (filter.dependsOn) {
          const parentFc = existingControls[filter.dependsOn];
          if (parentFc) {
            parentFc.valueChanges.subscribe((clienteId: string | null) => {
              const found = clienteId ? cascadingData.find(c => c.id === clienteId) : null;
              commessaOpts.set((found?.commesse ?? []).map(c => ({ id: c.id, description: c.label })));
              clienteId ? commessaFc.enable() : (commessaFc.setValue(null), commessaFc.disable());
            });
          }
        }
        break;
      }

      case 'cascade-task': {
        const taskOpts = signal<{ id: string; description: string }[]>([]);
        const taskFc = existingControls[filter.id] ?? new FormControl({ value: null, disabled: true });
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.COMBO, formControl: taskFc, options: taskOpts, multiple: false, resetButton: false, class: ['col-6', 'filter-col'], keyCombo: { keyId: 'id', keyDescription: 'description' } });
        if (filter.dependsOn) {
          const parentFc = existingControls[filter.dependsOn];
          if (parentFc) {
            parentFc.valueChanges.subscribe((commessaId: string | null) => {
              const allCommesse = cascadingData.flatMap(c => c.commesse);
              const found = commessaId ? allCommesse.find(c => c.id === commessaId) : null;
              taskOpts.set((found?.task ?? []).map(t => ({ id: t.id, description: t.label })));
              commessaId ? taskFc.enable() : (taskFc.setValue(null), taskFc.disable());
            });
          }
        }
        break;
      }

      default:
        builder.addForm({ formName: filter.id, title: filter.label, type: TYPE_CONTROL_FORM.TEXT, formControl: fc, class: ['col-6', 'filter-col'] });
    }
  }

  return builder.build();
}
