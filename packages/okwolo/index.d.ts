// @okwolo/state
type action = {
    type: string;
    target: string[] | ((state: any, params: object) => string[]);
    handler: (target: any, params: object) => any;
}

type watcher = (state: any, actionType: string, params: object) => void;

type middleware = (
    next: (state?: any, actionType?:string, params?: object) => void,
    state: any,
    actionType: string,
    params: object,
) => void;

// @okwolo/router
type route = {
    path: string;
    callback: (params: object) => void;
};

type base = string;

// @okwolo/dom
type target = any;

type builder = (state: any) => element;

type state = (state: any) => void;

type draw = (target: any, vdom: vdom) => vdom;

type update = (target: any, vdom: vdom, currentVdom: vdom) => vdom;

type build = (element: element) => vdom;

type prebuild = (element: element) => element;

type postbuild = (vdom: vdom) => vdom;

type element = Array<{
    tagName: string;
    attributes?: object;
    children?: Array<element>;
}> | Array<{
    component: (props: object) => element;
    props?: object;
    children?: any;
}> | string;

type vdom = {
    tagName: string;
    attributes: object;
    children: Array<vdom>
} | {
    text: string;
}

type blob = {
    action?: action | Array<action>;
    watcher?: watcher | Array<watcher>;
    middleware?: middleware | Array<middleware>;
    route?: route;
    base?: base;
    target?: target;
    builder?: builder;
    state?: state;
    draw?: draw;
    update?: update;
    build?: build;
    prebuild?: prebuild;
    postbuild?: postbuild;
}

type updater = (state: any) => any;

declare module "okwolo" {
    function okwolo(target?: any, window?: Window): {
        (generator: () => builder): void;
        (path: string, generator: (params: object) => builder): void;
        setState(state: any): void;
        setState(updater: updater): void;
        getState(): any;
        redirect(path: string, params?: object): boolean;
        show(path: string, params?: object): boolean;
        act(state: any, type: string, params?: object): void;
        act(updater: updater): void;
        update: () => void;
        undo: () => void;
        redo: () => void;
        use(blob: blob): void;
    };
    export = okwolo;
}

declare module "okwolo/kits/standard" {
    function okwolo(target?: any, window?: Window): {
        (generator: () => builder): void;
        (path: string, generator: (params: object) => builder): void;
        setState(state: any): void;
        setState(updater: updater): void;
        getState(): any;
        redirect(path: string, params?: object): boolean;
        show(path: string, params?: object): boolean;
        act(state: any, type: string, params?: object): void;
        act(updater: updater): void;
        update: () => void;
        undo: () => void;
        redo: () => void;
        use(blob: blob): void;
    };
    export = okwolo;
}

declare module "okwolo/kits/lite" {
    function okwolo(target?: any, window?: Window): {
        (generator: () => builder): void;
        (path: string, generator: (params: object) => builder): void;
        setState(state: any): void;
        setState(updater: updater): void;
        getState(): any;
        redirect(path: string, params?: object): boolean;
        show(path: string, params?: object): boolean;
        update: () => void;
        use(blob: {
            route?: route;
            base?: base;
            target?: target;
            builder?: builder;
            state?: state;
            draw?: draw;
            update?: update;
            build?: build;
            prebuild?: prebuild;
            postbuild?: postbuild;
        }): void;
    };
    export = okwolo;
}

declare module "okwolo/kits/server" {
    function okwolo(target?: (output: string) => void): {
        (generator: () => builder): void;
        setState(state: any): void;
        setState(updater: updater): void;
        getState(): any;
        update: () => void;
        use(blob: {
            target?: (output: string) => void;
            builder?: builder;
            state?: state;
            draw?: draw;
            update?: update;
            build?: build;
            prebuild?: prebuild;
            postbuild?: postbuild;
        }): void;
    };
    export = okwolo;
}

declare module "okwolo/kits/routerless" {
    function okwolo(target?: any, window?: Window): {
        (generator: () => builder): void;
        setState(state: any): void;
        setState(updater: updater): void;
        getState(): any;
        act(state: any, type: string, params?: object): void;
        act(updater: updater): void;
        update: () => void;
        undo: () => void;
        redo: () => void;
        use(blob: blob): {
            action?: action | Array<action>;
            watcher?: watcher | Array<watcher>;
            middleware?: middleware | Array<middleware>;
            target?: target;
            builder?: builder;
            state?: state;
            draw?: draw;
            update?: update;
            build?: build;
            prebuild?: prebuild;
            postbuild?: postbuild;
        };
    };
    export = okwolo;
}

declare module "okwolo/kits/stateless" {
    function okwolo(target?: any, window?: Window): {
        (generator: () => builder): void;
        (path: string, generator: (params: object) => builder): void;
        setState(state: any): void;
        setState(updater: updater): void;
        getState(): any;
        redirect(path: string, params?: object): boolean;
        show(path: string, params?: object): boolean;
        update: () => void;
        use(blob: blob): {
            route?: route;
            base?: base;
            target?: target;
            builder?: builder;
            state?: state;
            draw?: draw;
            update?: update;
            build?: build;
            prebuild?: prebuild;
            postbuild?: postbuild;
        };
    };
    export = okwolo;
}