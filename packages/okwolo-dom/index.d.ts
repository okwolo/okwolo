declare module "@okwolo/dom" {
    function dom(target?: any, window?: Window): {
        (builder: builder): void;
        setState(state: any): void;
        getState(): any;
        use(blob: {
            target?: target;
            builder?: builder;
            state?: state;
            draw?: draw;
            update?: update;
            build?: build;
            prebuild?: prebuild;
            postbuild?: postbuild;
        }): any[];
    };
    export = dom;
}