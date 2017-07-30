declare module "@okwolo/history" {
    function history(): {
        action: Array<{
            type: 'string';
            target: Array<string>;
            handler: () => void;
        }>;
        watcher: (state: any, type: string) => void;
    };
    export = history;
}