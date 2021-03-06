import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";

import { JobService } from "app/services";

@Component({
    selector: "bex-terminate-job-dialog",
    templateUrl: "terminate-job-dialog.html",
})
export class TerminateJobDialogComponent {
    public jobId: string;
    public processing: boolean = false;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<TerminateJobDialogComponent>,
        private jobService: JobService) {
    }

    @autobind()
    public ok() {
        let options: any = {};
        this.processing = true;

        return this.jobService.terminate(this.jobId, options);
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }
}
