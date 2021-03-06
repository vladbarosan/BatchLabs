import { Injectable } from "@angular/core";
import { Job } from "app/models";
import { Observable, Subject } from "rxjs";

import BatchClient from "../api/batch/batch-client";
import { DataCache, RxEntityProxy, RxListProxy, getOnceProxy } from "./core";
import ServiceBase from "./service-base";

export interface JobParams {
    id?: string;
}

@Injectable()
export class JobService extends ServiceBase {
    /**
     * Triggered only when a job is added through this app.
     * Used to notify the list of a new item
     */
    public onJobAdded = new Subject<string>();

    private _basicProperties: string = "id,displayName,state,creationTime,poolInfo";
    private _cache = new DataCache<Job>();

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(initialOptions: any = {}): RxListProxy<{}, Job> {
        return new RxListProxy<{}, Job>(Job, {
            cache: () => this._cache,
            proxyConstructor: (params, options) => BatchClient.job.list(options),
            initialOptions,
        });
    }

    public get(jobId: string, options: any = {}): RxEntityProxy<JobParams, Job> {
        return new RxEntityProxy(Job, {
            cache: () => this._cache,
            getFn: (params: JobParams) => {
                return BatchClient.job.get(params.id, options);
            },
            initialParams: { id: jobId },
        });
    }

    public getOnce(jobId: string, options: any = {}): Observable<Job> {
        return getOnceProxy(this.get(jobId, options));
    }

    /**
     * Starts the deletion process
     */
    public delete(jobId: string, options: any = {}): Observable<void> {
        const observable = Observable.fromPromise<any>(BatchClient.job.delete(jobId, options));
        observable.subscribe({
            error: (error) => {
                console.error("Error deleting job: " + jobId, error);
            },
        });

        return observable;
    }

    /**
     * Once delete has completed we call this to remove it from the cache
     */
    public notifyJobDeleted(jobId) {
        this._cache.deleteItemByKey(jobId);
    }

    public terminate(jobId: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.terminate(jobId, options));
    }

    public disable(jobId: string, disableTasks: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.disable(jobId, disableTasks, options));
    }

    public enable(jobId: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.enable(jobId, options));
    }

    public add(job: any, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.add(job, options));
    }
}
