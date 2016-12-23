function diff(original, successor) {

    // get types
    var o_type = Object.prototype.toString.call(original);
    var s_type = Object.prototype.toString.call(successor);

    // reject when different types
    if (o_type !== s_type) {
        return false;
    }

    // compare two objects or arrays
    if (o_type === '[object Object]' || o_type === '[object Array]') {
        var keys = Object.keys(original);
        // TODO check for add opeation
        /*var new_keys = Object.keys(successor);*/
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
        m:[
            1
        ],
        a:1,
        b:[
            0,
            'a',
            5,
            {
                a:3,
                b:{
                    c:{
                        d:{
                            e:1
                        },
                        x:0
                    }
                }
            }
        ],
        c:'aasdfdsfs',
        n: undefined,
        xx: 'sdsd'
    }, {
        m:{
            '0':1
        },
        a:3,
        b:[
            0,
            2,
            5,
            {
                a:3,
                b:{
                    c:{
                        d:{
                            e:12
                        },
                        x:1
                    }
                }
            }
        ],
        c:'aasdfdsfs',
        n: null,
        pp: ['a']
    }
)));