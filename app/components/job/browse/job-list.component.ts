import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskManager } from "app/components/base/background-task";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent, QuickListItemStatus } from "app/components/base/quick-list";
import { ListOrTableBase } from "app/components/base/selectable-list";
import { TableComponent } from "app/components/base/table";
import { Job, JobState } from "app/models";
import { SchedulingErrorDecorator } from "app/models/decorators";
import { JobService } from "app/services";
import { RxListProxy } from "app/services/core";
import { Filter } from "app/utils/filter-builder";
import { DeleteJobAction } from "../action";

@Component({
    selector: "bex-job-list",
    templateUrl: "./job-list.html",
})
export class JobListComponent extends ListOrTableBase implements OnInit, OnDestroy {
    public status: Observable<LoadingStatus>;
    public data: RxListProxy<{}, Job>;
    public searchQuery = new FormControl();

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    @ViewChild(TableComponent)
    public table: TableComponent;

    @Input()
    public quickList: boolean;

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;

        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter.toOData() });
        }

        this.data.fetchNext();
    }
    public get filter(): Filter { return this._filter; };

    private _filter: Filter;

    // todo: ask tim about setting difference select options for list and details.
    private _baseOptions = {};
    private _onJobAddedSub: Subscription;

    constructor(router: Router, private jobService: JobService, private taskManager: BackgroundTaskManager) {
        super();
        this.data = this.jobService.list(this._baseOptions);
        this.status = this.data.status;
        this._onJobAddedSub = jobService.onJobAdded.subscribe((jobId) => {
            this.data.loadNewItem(jobService.get(jobId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._onJobAddedSub.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public jobStatus(job: Job): QuickListItemStatus {
        if (job.executionInfo && job.executionInfo.schedulingError) {
            return QuickListItemStatus.warning;
        } else {
            switch (job.state) {
                case JobState.completed:
                    return QuickListItemStatus.normal;
                case JobState.disabled:
                case JobState.disabling:
                    return QuickListItemStatus.accent;
                case JobState.active:
                case JobState.enabling:
                    return QuickListItemStatus.lightaccent;
                case JobState.terminating:
                    return QuickListItemStatus.important;
                default:
                    return QuickListItemStatus.normal;
            }
        }
    }

    public jobStatusText(job: Job): string {
        if (job.executionInfo && job.executionInfo.schedulingError) {
            return new SchedulingErrorDecorator(job.executionInfo.schedulingError).summary;
        } else {
            switch (job.state) {
                case JobState.completed:
                    return "";
                default:
                    return `Job is ${job.state}`;
            }
        }
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }

    public deleteSelected() {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteJobAction(this.jobService, this.selectedItems);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }
}
