//创建set，用于判断是否存在重复元素
var set = new Set();
//创建全局属性数组
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
//初始化队列
var queue = [];

//遍历数组，将数组中的元素放到队列中
for(var p of globalProperties){
    queue.push({
        path:p,
        object:this[p]
    });
}

//声名轮询时，当前操作的元素
let current;

//遍历队列
while(queue.length){
    current = queue.shift();
    debugger;
    console.log(current);
    if(set.has(current.object)){
        continue;
    }
    set.add(current.object);

    let proto = Object.getPrototypeOf(current.object);
    if(proto){
        queue.push({
            path: current.path.concat("__proto__"),
            object:proto
        });
    }

    for (let p of Object.getOwnPropertyNames(current.object)) {
        var property = Object.getOwnPropertyDescriptor(current.object,p);

        console.log([p]);
        if (property.hasOwnProperty["value"] && 
            ((property.value != null) && (typeof property.value == 'object')||(typeof property.value == 'function'))
                && property.value instanceof Object) {
            queue.push({
                path:current.path.concat([p]),
                object:property.value
            })
        }

        if ((property.hasOwnProperty["get"]) && (typeof property.get == "function")) {
            queue.push(
                {
                    path: current.path.concat([p]),
                    object: property.value
                }
            );
        }

        if ((property.hasOwnProperty["set"]) && (typeof property.get == "function")){
            queue.push(
                {
                    path: current.path.concat([p]),
                    object: property.value
                }
            );
        }
    }
}
