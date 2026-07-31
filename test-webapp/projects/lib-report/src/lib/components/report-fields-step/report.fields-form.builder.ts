import { FormControl } from '@angular/forms';
import { ConfigForm, DynamicFormBuilder, TYPE_CONTROL_FORM } from 'pl-dynamicform';

import { ReportFieldGroupField } from '../../index.models';

/**
 * Crea un ConfigForm con un singolo gruppo di CHECKBOX per un gruppo di campi.
 * Usato nel fields-step: un dynamic-form per gruppo (accordion nativo).
 * NOTA: pl-dynamicform non applica class[] su app-checkbox; il layout 2-colonne
 * è gestito via ::ng-deep SCSS sul contenitore .fields-list.
 */
export function buildGroupFieldsForm(
  fields: ReportFieldGroupField[],
  existingControls: Record<string, FormControl>
): ConfigForm {
  const builder = DynamicFormBuilder.create({}).addGroup('', ['row', 'g-0']);

  for (const field of fields) {
    const fc = existingControls[field.id] ?? new FormControl(false);
    builder.addForm({
      formName: field.id,
      title: field.label,
      type: TYPE_CONTROL_FORM.CHECKBOX,
      formControl: fc,
    });
  }

  return builder.build();
}
