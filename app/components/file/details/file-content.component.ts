import { AfterViewInit, Component, ElementRef, Input, OnChanges } from "@angular/core";
import { Subscription } from "rxjs";

import { ScrollableComponent, ScrollableService } from "app/components/base/scrollable";
import { FileService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bex-file-content",
    templateUrl: "file-content.html",
})
export class FileContentComponent implements OnChanges, AfterViewInit {
    @Input()
    public jobId: string;

    @Input()
    public taskId: string;

    @Input()
    public filename: string;
    public inter;

    public followingLog = false;

    public lastContentLength = 0;
    public notFound = false;

    public lines = [];

    public scrollable: ScrollableComponent;
    public currentSubscription: Subscription;

    constructor(
        private scrollableService: ScrollableService,
        private fileService: FileService,
        private element: ElementRef) {
    }

    public ngAfterViewInit() {
        this.scrollable = this.scrollableService.getParentSrollable(this.element.nativeElement);
    }

    public ngOnChanges(inputs) {
        if (this.inter) {
            clearInterval(this.inter);
        }
        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }
        this.notFound = false;
        this.lines = [];
        this.lastContentLength = 0;
        this.inter = setInterval(() => {
            this._updateFileContent();
        }, 5000);
    }

    public toggleFollowLog() {
        this.followingLog = !this.followingLog;
        if (this.followingLog) {
            this._scrollToBottom();
        }
    }

    private _updateFileContent() {
        this.currentSubscription = this.fileService.getFilePropertiesFromTask(this.jobId, this.taskId, this.filename)
            .subscribe({
                next: (result: any) => {
                    if (result && result.data && result.data.properties) {
                        const newContentLength = result.data.properties.contentLength;
                        if (newContentLength !== this.lastContentLength) {
                            this._loadUpTo(newContentLength);
                        }
                    }
                },
                error: (e) => {
                    this._processError(e);
                },
            });
    }

    private _loadUpTo(newContentLength: number) {
        this.currentSubscription = this.fileService.getFileContentFromTask(this.jobId, this.taskId, this.filename, {
            fileGetFromTaskOptions: {
                ocpRange: `bytes=${this.lastContentLength}-${newContentLength}`,
            },
        }).subscribe((result) => {
            this.lastContentLength = newContentLength;
            const newLines = result.content.toString().split("\n");
            let first = "";
            if (newLines.length > 1) {
                first = newLines.shift();
            }
            if (this.lines.length === 0) {
                this.lines = [first];
            } else {
                this.lines[this.lines.length - 1] += first;
            }
            this.lines = this.lines.concat(newLines);
            if (this.followingLog) {
                setTimeout(() => {
                    this._scrollToBottom();
                });
            }
            this.currentSubscription = null;
        }, (e) => {
            this._processError(e);
        });
    }

    private _processError(e) {
        this.currentSubscription = null;

        if (e.statusCode === Constants.HttpCode.NotFound) {
            this.notFound = true;
            return;
        }

        console.error("Error is", e.statusCode, Object.assign({}, e));
    }

    private _scrollToBottom() {
        if (this.scrollable) {
            this.scrollable.scrollToBottom(); // TODO make a scrollToBottom
        }
    }
}
