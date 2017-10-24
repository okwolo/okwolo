type queue = {
    add(func: Function): void;
    done(): void;
}

declare module "@okwolo/utils" {
    function utils(): {
        deepCopy(obj: any): any;
        err(message: string): void;
        assert(assertion: boolean, message: string, ...culprits: Array<any>): void;
        isDefined(value: any): boolean;
        isNull(value: any): boolean;
        isArray(value: any): boolean;
        isFunction(value: any): boolean;
        isString(value: any): boolean;
        isObject(value: any): boolean;
        isNode(value: any): boolean;
        makeQueue(): queue;
        makeBus(queue?: queue): {
            (event: object): void;
            on: (type: string, handler: Function) => void;
        };
    };
    export = utils;
}