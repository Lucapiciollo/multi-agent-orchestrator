import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlDynamicFormModule } from 'pl-dynamicform';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ReportStoreModule } from './redux/report-store.module';
import { IndexComponent } from './index.component';
import { CascadeFilterComponent } from './components/cascade-filter/cascade-filter.component';
import { MyReportCardComponent } from './components/my-report-card/my-report-card.component';
import { MyReportsPanelComponent } from './components/my-reports-panel/my-reports-panel.component';
import { PeriodHalfPickerComponent } from './components/period-half-picker/period-half-picker.component';
import { ReportCategoryComponent } from './components/report-category/report-category.component';
import { ReportFieldsStepComponent } from './components/report-fields-step/report-fields-step.component';
import { ReportFiltersStepComponent } from './components/report-filters-step/report-filters-step.component';
import { ReportPresetCardComponent } from './components/report-preset-card/report-preset-card.component';
import { ReportPreviewStepComponent } from './components/report-preview-step/report-preview-step.component';
import { ReportSubSectionComponent } from './components/report-sub-section/report-sub-section.component';
import { ReportViewSwitchComponent } from './components/report-view-switch/report-view-switch.component';
import { StoricoFilterBarComponent } from './components/storico-filter-bar/storico-filter-bar.component';
import { StoricoStatusBadgeComponent } from './components/storico-status-badge/storico-status-badge.component';
import { StoricoTableComponent } from './components/storico-table/storico-table.component';
import { ReportGuard } from './index.guard';
import { ReportService } from './index.service';
import { ConfirmDeleteDialogComponent } from './dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ReportWizardDialogComponent } from './dialogs/report-wizard-dialog/report-wizard-dialog.component';
import { StoricoDetailDialogComponent } from './dialogs/storico-detail-dialog/storico-detail-dialog.component';

@NgModule({
  declarations: [
    IndexComponent,
    CascadeFilterComponent, MyReportCardComponent, MyReportsPanelComponent,
    PeriodHalfPickerComponent, ReportCategoryComponent, ReportFieldsStepComponent,
    ReportFiltersStepComponent, ReportPresetCardComponent, ReportPreviewStepComponent,
    ReportSubSectionComponent, ReportViewSwitchComponent, StoricoFilterBarComponent,
    StoricoStatusBadgeComponent, StoricoTableComponent,
    ConfirmDeleteDialogComponent, ReportWizardDialogComponent, StoricoDetailDialogComponent,
  ],
  imports: [
    CommonModule, HttpClientModule, ReactiveFormsModule, OverlayModule, PlDynamicFormModule,
    // ReportRoutingModule rimosso: il routing è responsabilità del consumer (app-side)
    // L'app dichiara le child routes con data.view in report-routing.module.ts
    ReportStoreModule,
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatExpansionModule, MatTabsModule, MatBadgeModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule, MatTableModule,
    MatPaginatorModule, MatStepperModule, MatProgressBarModule, MatTooltipModule,
  ],
  exports: [IndexComponent],
  providers: [ReportGuard, ReportService],
})
export class ReportModule {}