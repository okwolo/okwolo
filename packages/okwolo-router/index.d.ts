declare module "@okwolo/router" {
    type queue = {
        add(func: Function): void;
        done(): void;
    }

    type bus = (queue?: queue) => {
        (event: object): void;
        on: (type: string, handler: Function) => void;
    }

    function router(buses: {
        emit: bus;
        use: bus;
    }): void;
    export = router;
}