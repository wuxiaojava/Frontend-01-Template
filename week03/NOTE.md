# 第三周学习总结
该部分内容根据 ECMA-262.pdf    page127 进行梳理
对其中的内容并不是特别理解，还需要花时间对每一项进行理解，后期会将理解内容补充到该文档中

参考 9.4 Built-in Exotic Object Internal Methods and Slots

1. Bound Function Exotic Objects
 1.1 [[Call]]
 1.2 [[Construct]]
 1.3 BoundFunctionCreate

2. Array Exotic Objects
 2.1 [[DefineOwnProperty]]
 2.2 ArrayCreate
 2.3 ArraySpeciesCreate
 2.4 ArraySetLength

3. String Exotic Objects
 3.1 [[GetOwnProperty]]
 3.2 [[DefineOwnProperty]]
 3.3 [[OwnPropertyKeys]]
 3.4 StringCreate
 3.5 StringGetOwnProperty

4. Arguments Exotic Objects
 4.1 [[GetOwnProperty]]
 4.2 [[DefineOwnProperty]]
 4.3 [[Get]]
 4.4 [[Set]]
 4.5 [[Delete]]
 4.6 CreateUnmappedArgumentsObject
 4.7 CreateMappedArgumentsObject
    4.7.1 MakeArgGetter
    4.7.2 MakeArgSetter

5. Integer-Indexed Exotic Objects
 5.1 [[GetOwnProperty]]
 5.2 [[HasProperty]]
 5.3 [[DefineOwnProperty]
 5.4 [[Get]]
 5.5 [[Set]]
 5.6 [[OwnPropertyKeys]]
 5.7 IntegerIndexedObjectCreate
 5.8 IntegerIndexedElementGet  
 5.9 IntegerIndexedElementSet

6. Module Namespace Exotic Objects
 6.1 [[SetPrototypeOf]]
 6.2 [[IsExtensible]]
 6.3 [[PreventExtensions]]
 6.4 [[GetOwnProperty]
 6.5 [[DefineOwnProperty]]
 6.6 [[HasProperty]]
 6.7 [[Get]]
 6.8 [[Set]]
 6.9 [[Delete]]
 6.10 [[OwnPropertyKeys]]
 6.11 ModuleNamespaceCreate

7. Immutable Prototype Exotic Objects
 7.1 [[SetPrototypeOf]]
 7.2 SetImmutablePrototype