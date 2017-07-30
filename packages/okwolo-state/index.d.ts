declare module "@okwolo/state" {
    function state(): {
        act(state: any, type: string, params?: object): void;
        use(blob: {
            action?: action | Array<action>;
            watcher?: watcher | Array<watcher>;
            middleware?: middleware | Array<middleware>;
        }): any[];
    };
    export = state;
}