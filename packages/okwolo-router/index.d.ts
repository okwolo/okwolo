declare module "@okwolo/router" {
    function router(): {
        redirect(path: string, params?: object): boolean;
        show(path: string, params?: object): boolean;
        use(blob: {
            route?: route | Array<route>;
            base?: base;
        }): any[];
    };
    export = router;
}