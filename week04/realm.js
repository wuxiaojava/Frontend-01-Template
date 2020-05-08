var set = new Set();
var globalProperties = [
    "eval",
    "isFinite",
    "isNaN",
    "parseInt",
    "parseFloat",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "Array",
    "Date",
    "RegExp",
    "Promise",
    "Proxy",
    "WeakMap",
    "Map",
    "Set",
    "WeakSet",
    "Function",
    "Boolean",
    "String",
    "Number",
    "Symbol",
    "Object",
    "EvalError",
    "RangeError",
    "Error",
    "ReferenceError",
    "SyntaxError",
    "TypeError",
    "URIError",
    "ArrayBuffer",
    "SharedArrayBuffer",
    "Float32Array",
    "Float64Array",
    "DataView",
    "Int8Array",
    "Int16Array",
    "Int32Array",
    "Uint8Array",
    "Uint16Array",
    "Uint32Array",
    "Uint8ClampedArray",
    "Atomics",
    "JSON",
    "Math",
    "Reflect"
];



var queue = [];

for(var p of globalProperties){
    console.log(typeof p);
    queue.push({
        path:[p],
        object:this[p]
    });
}

// debugger;
console.log(queue);
let current;

while(queue.length){
    current = queue.shift();
    console.log(current.path.join('.'));
    if(set.has(current.object)){
        continue;
    }
    set.add(current.object);

    console.log(current);

    let proto = Object.getPrototypeOf(current.object);
    if(proto){
        queue.push({
            path: current.path.concat("__proto__"),
            object:proto
        });
    }

    for (let p of Object.getOwnPropertyNames(current.object)) {
        var property = Object.getOwnPropertyDescriptor(current.object,p);

        if (property.hasOwnProperty["value"] && 
            ((property.value != null) && (typeof property.value == 'object')||(typeof property.value == 'function'))
                && property.value instanceof Object) {
            queue.push({
                path:current.path.concat([p]),
                object:property.value
            })
        }

        if ((property.hasOwnProperty["get"]) && (typeof property.get == "function")) {
            // debugger;
            queue.push(
                {
                    path: current.path.concat([p]),
                    object: property.value
                }
            );
        }

        if ((property.hasOwnProperty["set"]) && (typeof property.get == "function")){
            // debugger;
            queue.push(
                {
                    path: current.path.concat([p]),
                    object: property.value
                }
            );
        }
    }
}
