import { createActionGroup, emptyProps, props } from '@ngrx/store';

import {
  CascadingClient,
  ReportCategory,
  SavedReport,
  StoricoFilters,
  StoricoRecord,
} from 'lib-report';

/**
 * report.actions.ts — NgRx actions for the "Report" feature (lib-report)
 *
 * Only redux/report.effects.ts is allowed to translate the "load*" /
 * "save*" / "update*" / "delete*" / "request*" / "download*" actions into
 * calls against index.service.ts.
 */
export const ReportActions = createActionGroup({
  source: 'Report',
  events: {
    // Report catalog (replaces REPORTS / JS-002)
    'Load Report Catalog': emptyProps(),
    'Load Report Catalog Success': props<{ categories: ReportCategory[] }>(),
    'Load Report Catalog Failure': props<{ error: string }>(),

    // Cascading data (replaces CASCADING_DATA / JS-001)
    'Load Cascading Data': emptyProps(),
    'Load Cascading Data Success': props<{ cascadingData: CascadingClient[] }>(),
    'Load Cascading Data Failure': props<{ error: string }>(),

    // My reports CRUD (replaces JS-051/052/054)
    'Save My Report': props<{ subId: string; payload: SavedReport }>(),
    'Save My Report Success': props<{ subId: string; report: SavedReport }>(),
    'Save My Report Failure': props<{ error: string }>(),

    'Update My Report': props<{
      subId: string;
      index: number;
      payload: SavedReport;
    }>(),
    'Update My Report Success': props<{
      subId: string;
      index: number;
      report: SavedReport;
    }>(),
    'Update My Report Failure': props<{ error: string }>(),

    'Delete My Report': props<{ subId: string; index: number }>(),
    'Delete My Report Success': props<{ subId: string; index: number }>(),
    'Delete My Report Failure': props<{ error: string }>(),

    // Storico (replaces STORICO_DATA / JS-007 + JS-060..068)
    'Load Storico': emptyProps(),
    'Load Storico Success': props<{ items: StoricoRecord[] }>(),
    'Load Storico Failure': props<{ error: string }>(),

    'Set Storico Filters': props<{ filters: Partial<StoricoFilters> }>(),
    'Reset Storico Filters': emptyProps(),
    'Set Storico Page': props<{ pageIndex: number }>(),
    'Set Storico Page Size': props<{ pageSize: number }>(),

    // Export (replaces doExport / JS-048)
    'Request Export': props<{
      subId: string;
      format: string;
      filters: Record<string, unknown>;
      columns: string[];
    }>(),
    'Request Export Success': props<{ record: StoricoRecord }>(),
    'Request Export Failure': props<{ error: string }>(),

    // Storico download (replaces doStoricoDownload / JS-071)
    'Download Storico': props<{ id: string }>(),
    'Download Storico Success': props<{ record: StoricoRecord }>(),
    'Download Storico Failure': props<{ error: string }>(),
  },
});
