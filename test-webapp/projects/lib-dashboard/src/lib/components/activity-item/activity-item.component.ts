// components/activity-item/activity-item.component.ts — lib-dashboard
// Presentazionale (×4, @for track activity.id): riceve solo @Input().
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Activity } from '../../index.models';

@Component({
  selector: 'lib-dashboard-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityItemComponent {
  @Input({ required: true }) activity!: Activity;
}
