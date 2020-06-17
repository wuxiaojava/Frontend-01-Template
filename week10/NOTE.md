# 第十周学习笔记
DOM

EVENTS

Range





Range API

var range = new Range();
range.setStart(element,9);
range.setEnd(element,4);
var range = document.getSelection().getRangeAt(0);

range.setStartBefore
range.setEndBefore
range.setStartAfter
range.setEndAfter
range.selectNode
range.selectNodeContents

var fragment = range.extrctContents();
range.insertNode(documnt.createTextNode('aaaa'));


CSSOM
document.stylesheets
document.stylesheets[0].cssRules
document.stylesheets[0].insertRule("p {color:pink;}",0);
document.stylesheets[0].removeRule(0);


CSSStyleRule


CSSCharsetRule...@rule

getComputeStyle(elt,pseudoElt);
elt想要获取的元素
pseudoElt可选，伪元素

