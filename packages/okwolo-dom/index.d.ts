declare module "@okwolo/dom" {
    type queue = {
        add(func: Function): void;
        done(): void;
    }

    type bus = (queue?: queue) => {
        (event: object): void;
        on: (type: string, handler: Function) => void;
    }

    function dom(buses: {
        exec: bus;
        use: bus;
    }): void;
    export = dom;
}