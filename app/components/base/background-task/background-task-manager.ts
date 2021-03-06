import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

/**
 * Function that run the task.
 * @param progress Subject that should keep track of the progress(from 0 to 100);
 */
type TaskFunction = (task: BackgroundTask) => Observable<any>;
export interface NamedTaskFunction {
    name: string;
    func: TaskFunction;
};

export abstract class BackgroundTask {
    /**
     * Delay the task will wait before notifying the managaer it has completed
     */
    public static readonly completeDelay = 1000;
    public static idCounter = 0;

    public id: string;
    public progress = new BehaviorSubject<number>(-1);
    public name = new BehaviorSubject<string>("");
    public done: Observable<boolean>;

    protected _done = new BehaviorSubject<boolean>(false);

    constructor(protected taskManager: BackgroundTaskManager) {
        this.done = this._done.asObservable();
        this.id = (BackgroundTask.idCounter++).toString();
    }

    public abstract start(): void;

    protected end() {
        this._done.next(true);
        setTimeout(() => {
            this.taskManager.completeTask(this.id);
        }, BackgroundTask.completeDelay);
    }
}

export class SingleBackgroundTask extends BackgroundTask {
    constructor(taskManager: BackgroundTaskManager, name: string, public func: TaskFunction) {
        super(taskManager);
        this.name.next(name);
    }

    public start() {
        const obs = this.func(this);
        obs.subscribe({
            complete: () => {
                this.end();
            },
        });
    }
}

export class GroupedBackgroundTask extends BackgroundTask {
    public progress = new BehaviorSubject<number>(0);
    constructor(
        taskManager: BackgroundTaskManager,
        private _baseName: string,
        private _tasks: NamedTaskFunction[]) {

        super(taskManager);
    }

    public start() {
        this._runNextTask();
    }

    private _runNextTask(index = 0) {
        const totalTask = this._tasks.length;

        if (index === totalTask) {
            this.end();
            return;
        }
        const task = this._tasks[index];
        this.progress.next((index + 0.2) / totalTask * 100);
        const obs = task.func(null);
        this.name.next(`${this._baseName}: ${task.name} (${index + 1}/${totalTask})`);
        obs.subscribe({
            complete: () => {
                this.progress.next((index + 1) / totalTask * 100);
                this._runNextTask(index + 1);
            },
        });
    }
}

@Injectable()
export class BackgroundTaskManager {
    public runningTasks: Observable<List<BackgroundTask>>;

    private _runningTasks = new BehaviorSubject<List<BackgroundTask>>(List([]));

    constructor() {
        this.runningTasks = this._runningTasks.asObservable();
    }

    public startTask(name, func: TaskFunction) {
        const task = new SingleBackgroundTask(this, name, func);
        this._queueTask(task);
    }

    public startTasks(name, tasks: NamedTaskFunction[]) {
        const task = new GroupedBackgroundTask(this, name, tasks);
        this._queueTask(task);
    }

    public completeTask(id: string) {
        const newTasks = List<BackgroundTask>(this._runningTasks.getValue().filter(x => x.id !== id));
        this._runningTasks.next(newTasks);
    }

    private _queueTask(task: BackgroundTask) {
        this._runningTasks.next(this._runningTasks.getValue().push(task));
        task.start();
    }

}
