'use strict';

// @fires blob.fetch [router]

module.exports = ({send}) => {
    // the store's initial value is undefined so it needs to be defaulted
    // to an empty array. this function should be the one calling the route
    // handler since it doesn't return it.
    const fetch = (store = [], path, params = {}) => {
        let found = false;
        store.find((registeredPath) => {
            let test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            // a non null value on the result of executing the query on the path
            // is considered a successful match.
            found = true;
            // the first element of the result array is the entire matched string.
            // this value is not useful and the following capture group results
            // are more relevant.
            test.shift();
            // the order of the keys and their values in the matched result is the
            // same and they share the same index. note that there is no protection
            // against tags that share the same key and that params can be overwritten.
            registeredPath.keys.forEach((key, index) => {
                params[key.name] = test[index];
            });
            registeredPath.handler(params);
            return found;
        });
        return found;
    };

    send('blob.fetch', fetch);
};
