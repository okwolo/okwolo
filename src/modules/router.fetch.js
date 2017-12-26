'use strict';

// @fires blob.fetch [router]

module.exports = ({send}) => {
    // the store's initial value is undefined so it needs to be defaulted
    // to an empty array. this function should be the one doing the action
    // defined in the route since it doesn't return it.
    const fetch = (store = [], path, params = {}) => {
        let found = false;
        store.find((registeredPath) => {
            let test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            // a non null value on the result of executing the query on the path
            // is considered a successful hit.
            found = true;
            // the first element of the result array is the entire matched string.
            // this value is not useful and the following capture group results
            // are more relevant.
            test.shift();
            // the order of the keys and their values in the matched result is the
            // same and their index is now shared. note that there is no protection
            // against param values being overwritten or tags to share the same key.
            registeredPath.keys.forEach((key, i) => {
                params[key.name] = test[i];
            });
            registeredPath.handler(params);
            return found;
        });
        return found;
    };

    send('blob.fetch', fetch);
};
