declare module "@okwolo/state" {
    type queue = {
        add(func: Function): void;
        done(): void;
    }

    type bus = (queue?: queue) => {
        (event: object): void;
        on: (type: string, handler: Function) => void;
    }

    function state(buses: {
        exec: bus;
        use: bus;
    }): void;
    export = state;
}