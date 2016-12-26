function deep_copy(object) {
    // TODO : make a more elegant solution
    return JSON.parse(JSON.stringify(object));
}


function diff(original, successor) {

    // get types
    var o_type = Object.prototype.toString.call(original);
    var s_type = Object.prototype.toString.call(successor);

    // reject when different types
    if (o_type !== s_type) {
        return false;
    }

    // functions are considered equal
    if (o_type === '[object Function]') {
        return true;
    }

    // compare two objects or arrays
    if (o_type === '[object Object]' || o_type === '[object Array]') {
        var keys = Object.keys(original);
        var new_keys = Object.keys(successor);
        // creating union of both arrays of keys
        if (o_type === '[object Array]') {
            var length_difference = new_keys.length - keys.length;
            if (length_difference > 0) {
                for (let i = length_difference; i > 0 ; --i) {
                    keys.push(new_keys[new_keys.length - i]);
                }
            }
        } else {
            var keys_obj = {};
            keys.forEach(function(key) {
                keys_obj[key] = true;
            });
            new_keys.forEach(function(key) {
                if (!keys_obj[key]) {
                    keys.push(key);
                }
            });
        }
        return keys.reduce(function(accumulator, key) {
            var temp = diff(original[key], successor[key]);
            if (temp !== true) {
                if (typeof accumulator === 'boolean') {
                    accumulator = [];
                }
                if (temp === false) {
                    accumulator.push([key]);
                } else {
                    temp.forEach(function(current) {
                        current.unshift(key);
                        accumulator.push(current);
                    });
                }
            }
            return accumulator;
        }, true);
    }

    // compare primitive types
    return original === successor;

}

console.log(JSON.stringify(diff(
    {
        a: {
            m: {
                a:2,
                b:1
            }
        },
        c: 0,
        z: [0, 2]
    }, {
        a: {
            m: {
                a:1,
                c:1
            }
        },
        b: 0,
        z: [0, 2, 3]
    }
)));