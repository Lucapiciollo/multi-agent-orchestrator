import { signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfigForm, DynamicFormBuilder, DynamicFormActionButton, TYPE_CONTROL_FORM } from 'pl-dynamicform';

export interface StoricoFilterSignals {
  templateOpts: WritableSignal<{ id: string; description: string }[]>;
  formatoOpts:  WritableSignal<{ id: string; description: string }[]>;
  statoOpts:    WritableSignal<{ id: string; description: string }[]>;
}

/**
 * Crea un ConfigForm per la storico-filter-bar usando pl-dynamicform.
 * I Signal per le options vengono restituiti per permettere l'aggiornamento
 * quando gli @Input cambiano (ngOnChanges).
 * Layout orizzontale: tutti i campi in un singolo gruppo row.
 */
export function buildStoricoFilterForm(
  controls: {
    dataRichiesta: FormControl;
    template:      FormControl;
    nomeFile:      FormControl;
    formato:       FormControl;
    stato:         FormControl;
  },
  templateOptions: string[],
  formatoOptions:  string[],
  statoOptions:    string[],
  onReset: () => void
): { config: ConfigForm; signals: StoricoFilterSignals } {

  const templateOpts = signal(templateOptions.map(o => ({ id: o, description: o })));
  const formatoOpts  = signal(formatoOptions.map(o => ({ id: o, description: o.toUpperCase() })));
  const statoOpts    = signal(statoOptions.map(o => ({ id: o, description: capitalize(o) })));

  const resetAction: DynamicFormActionButton = {
    label: 'Reset',
    visible: true,
    action: () => onReset(),
  };

  const config = DynamicFormBuilder.create({})
    .addGroup('', ['row', 'g-0', 'flex-nowrap'])
    .addForm({
      formName: 'dataRichiesta',
      title: 'Data richiesta',
      type: TYPE_CONTROL_FORM.DATA,
      formControl: controls.dataRichiesta,
      class: ['col-auto', 'sf-field'],
      placeholder: 'dd/mm/yyyy',
    })
    .addForm({
      formName: 'template',
      title: 'Template',
      type: TYPE_CONTROL_FORM.COMBO,
      formControl: controls.template,
      options: templateOpts,
      multiple: true,
      resetButton: false,
      class: ['col-auto', 'sf-field'],
      keyCombo: { keyId: 'id', keyDescription: 'description' },
    })
    .addForm({
      formName: 'nomeFile',
      title: 'Nome file',
      type: TYPE_CONTROL_FORM.TEXT,
      formControl: controls.nomeFile,
      class: ['col-auto', 'sf-field', 'sf-field--wide'],
    })
    .addForm({
      formName: 'formato',
      title: 'Formato',
      type: TYPE_CONTROL_FORM.COMBO,
      formControl: controls.formato,
      options: formatoOpts,
      multiple: true,
      resetButton: false,
      class: ['col-auto', 'sf-field'],
      keyCombo: { keyId: 'id', keyDescription: 'description' },
    })
    .addForm({
      formName: 'stato',
      title: 'Stato',
      type: TYPE_CONTROL_FORM.COMBO,
      formControl: controls.stato,
      options: statoOpts,
      multiple: true,
      resetButton: false,
      class: ['col-auto', 'sf-field'],
      keyCombo: { keyId: 'id', keyDescription: 'description' },
    })
    .build();

  return { config, signals: { templateOpts, formatoOpts, statoOpts } };
}

function capitalize(s: string): string {
  const label = s.replace(/-/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}
