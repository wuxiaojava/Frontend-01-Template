HTML的定义： XML 和 SGML

DTD 与 XML namespace

HTML标签-语义
合法元素：
1.Element
2.Text
3.Comment
4.DocumentType
5.ProcessingInstruction 
6.CDATA

导航类操作：
parentNode
childNodes
firstChild
lastChild
nextSilbing
previousSilbing

修改操作：
appendChild
insertBefore
removeChild
replaceChild

重点：
1.元素二次插入时，会自动删除第一次插入的位置
2.living collection 节点会实时变化

高级操作:
compareDocumentPosition:比较两个节点中关系的函数
contains:比较一个节点是否包含另外一个节点
isEqualNode:检查两个节点是否完全相同
isSameNode:检查两个节点是否时同一个节点
cloneNode：赋值一个节点，如果传入参数true则连同子元素做深拷贝

Browser API:

1.DOM:
    1.1.DOM API
    1.2.Events
    1.3.Range

2.CSSOM

3.BOM

4.WEB ANIMATION

5.CRYPTO