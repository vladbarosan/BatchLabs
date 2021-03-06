import { Record } from "immutable";
import { NameValuePair } from "./nameValuePair";

import { AffinityInformation }  from "./affinityInformation";
import { ApplicationPackageReference }  from "./applicationPackageReference";
import { ComputeNodeInformation }  from "./computeNodeInformation";
import { MultiInstanceSettings }  from "./multiInstanceSettings";
import { ResourceFile }  from "./resourceFile";
import { TaskConstraints }  from "./taskConstraints";
import { TaskDependencies }  from "./taskDependencies";
import { TaskExecutionInformation } from "./taskExecutionInformation";
import { TaskExitConditions } from "./taskExitConditions";

// tslint:disable:variable-name
const TaskRecord = Record({
    id: null,
    displayName: null,
    url: null,
    eTag: null,
    lastModified: null,
    creationTime: null,
    state: null,
    stateTransitionTime: null,
    previousState: null,
    previousStateTransitionTime: null,
    commandLine: null,
    runElevated: null,
    exitConditions: new TaskExitConditions(),
    resourceFiles: [],
    environmentSettings: null,
    affinityInfo: null,
    constraints: null,
    executionInfo: null,
    nodeInfo: null,
    multiInstanceSettings: null,
    stats: null,
    dependsOn: null,
    applicationPackageReferences: null,
});

/**
 * Class for displaying Batch task information.
 */
export class Task extends TaskRecord {
    public id: string;
    public displayName: string;
    public url: string;
    public eTag: string;
    public lastModified: Date;
    public creationTime: Date;
    public state: TaskState;
    public stateTransitionTime: Date;
    public previousState: TaskState;
    public previousStateTransitionTime: Date;
    public commandLine: string;
    public runElevated: boolean;

    public exitConditions: TaskExitConditions;
    public resourceFiles: ResourceFile[];
    public environmentSettings: NameValuePair[];
    public affinityInfo: AffinityInformation;
    public constraints: TaskConstraints;
    public executionInfo: TaskExecutionInformation;
    public nodeInfo: ComputeNodeInformation;
    public multiInstanceSettings: MultiInstanceSettings;
    public stats: any;                           // TaskStatistics
    public dependsOn: TaskDependencies;
    public applicationPackageReferences: ApplicationPackageReference[];

    constructor(data: any = {}) {
        super(Object.assign({}, data, {
            exitConditions: new TaskExitConditions(data.exitConditions),
        }));
    }
}

export type TaskState = "active" | "preparing" | "running" | "completed";
export const TaskState = {
    active: "active" as TaskState,
    preparing: "preparing" as TaskState,
    running: "running" as TaskState,
    completed: "completed" as TaskState,
};
