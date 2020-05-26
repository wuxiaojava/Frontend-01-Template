const css = require("css");
const layout = require("./layout");

const EOF = Symbol("EOF");//end of file 

let currentToken = null;
let currentAttribute = null;
let stack = [{type:"document",children:[]}];
let currentTextNode = null;

//加入一个新的函数 addCSSRules,这里我们把css规则暂存到一个数组里
let rules = [];

//收集CSS rules
function addCSSRules(text){
    var ast = css.parse(text);
    // console.log(JSON.stringify(ast,null,"    "));
    rules.push(...ast.stylesheet.rules);
}

//元素与css样式选择器进行匹配
function match(element,selector){
    if(!selector || !element.attributes){
        return false;
    }

    if(selector.charAt(0) == "#"){
        var attr = element.attributes.filter(attr => attr.name === "id")[0];
        if(attr && attr.value === selector.replace("#",'')){
            return true;
        }
    }else if(selector.charAt(0) == "."){
        var attr = element.attributes.filter(attr => attr.name === "class")[0];
        if (attr && attr.value === selector.replace(".", '')) {
            return true;
        }
    }else{
        if(element.tagName === selector){
            return true;
        }
    }
}

//使用四元运算符，计算优先级
function specificity(selector){
    var p = [0,0,0,0];
    var selectorParts = selector.split(" ");
    for(var part of selectorParts){
        if(part.charAt(0) == "#"){
            p[1] += 1;
        }else if(part.charAt(0) == "."){
            p[2] += 1;
        }else{
            p[3] += 1;
        }
    }
    return p;
}

//计算元素的CSS,并将结果赋值给元素的computeStyle属性
function computeCSS(element){
    var elements = stack.slice().reverse();
    if(!element.computeStyle){
        element.computeStyle = {};
    }

    for(let rule of rules){
        var selectorParts = rule.selectors[0].split(" ").reverse();
        if(!match(element,selectorParts[0])){
            continue;
        }

        var j = 1;
        for(var i = 0; i<elements.length; i++){
            if(match(elements[i],selectorParts[j])){
                j++;
            }
        }

        if(j >= selectorParts.length){
            matched = true;
        }

        if(matched){
            var sp = specificity(rule.selectors[0]);
            var computeStyle = element.computeStyle;

            for(var declaration of rule.declarations){
                if(!computeStyle[declaration.property]){
                    computeStyle[declaration.property] = {};
                    computeStyle[declaration.property].specificity = sp;
                }
                if (computeStyle[declaration.property].specificity){
                    computeStyle[declaration.property].value = declaration.value;
                    computeStyle[declaration.property].specificity = sp;
                } else if (compare(computeStyle[declaration.property].specificity,sp) < 0){
                    computeStyle[declaration.property].value = declaration.value;
                    computeStyle[declaration.property].specificity = sp;
                }
                
            }
            element.computeStyle = computeStyle;
        }
    }

    if(element.type != 'text'){
        // console.log(element);
    }
    
}

//计算元素的优先级
function compare(sp1,sp2){
    if(sp1[0] - sp2[0]){
        return sp1[0] - sp2[0];
    }
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1];
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2];
    }

    return sp1[3] - sp2[3];
}

function emit(token){
    let top = stack[stack.length - 1];
    if(token.type == "startTag"){
        let element = {
            type:"element",
            children:[],
            attributes:[]
        };

        element.tagName = token.tagName;

        for(let p in token){
            if(p != "type" || p != "tagName"){
                element.attributes.push({
                    name:p,
                    value:token[p]
                });
            }
        }
        //computeCSS(element);
        top.children.push(element);

        if(!token.isSelfClosing){
            stack.push(element);
        }

        currentTextNode = null;
    }else if(token.type == "endTag"){ 
        if(top.tagName != token.tagName){
            //console.log("Tag start and doesn't match!");
            //throw new Error("Tag start and doesn't match!");
        }else{
            //遇到style标签时，执行添加Css规则的操作
            if(top.tagName == "style"){
                addCSSRules(top.children[0].content);
            }
            //layout(top);
            stack.pop(); 
        }
        currentTextNode = null;
    } else if (token.type == "text") {
        if(currentTextNode == null){
            currentTextNode = {
                type:"text",
                content:""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}


//标签开始状态
function tagOpen(c){
    if(c == "/"){
        return endTagOpen;
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type:"startTag",
            tagName:""
        }
        return tagName(c);
    }else{
        emit({
            type:"text",
            content:c
        });
        return;
    }
}

//标签名状态
function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(c == "/"){
        return selfClosingStartTag;
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken.tagName += c;
        return tagName;
    }else if(c == '>'){
        emit(currentToken);
        return data;
    }else{
        currentToken.tagName += c;
        return tagName;
    }
}

//属性名准备状态
function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(c == "/" || c == ">" || c == EOF){
        return afterAttributeName;
    }else if(c == "="){

    }else{
        currentAttribute = {
            name: "",
            value:""
        }
        return attributeName(c);
    }
}

//属性名状态
function attributeName(c){
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    }else if(c == "="){
        return beforeAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == "\"" || c == "'" || c == "<"){

    }else{
        currentAttribute.name += c;
        return attributeName;
    }
}

//属性名结束状态
function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == "=") {
        return beforeAttributeValue;
    } else if (c == ">") {
        if (!currentAttribute) {
            currentToken[currentAttribute.name] = currentAttribute.value;
            emit(currentToken);
        }
        return data;
    } else if (c == EOF) {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        };
        currentToken[currentAttribute.name] = currentAttribute.value;
        return attributeName(c);
    }
}

//value值准备状态
function beforeAttributeValue(c){
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue;
    }else if(c == "\""){
        return doubleQuotedAttributeValue;
    }else if(c == "\'"){
        return singleQuotedAttributeValue;
    }else if(c == ">"){
        return data;
    }else{
        return UnquotedAttributeValue(c);
    }
}

//双引号value值状态
function doubleQuotedAttributeValue(c){
    if(c == "\""){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

//单引号value值状态
function singleQuotedAttributeValue(c){
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

//无引号value值状态
function UnquotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == "\u0000") {

    } else if (c == "\"" ||c == "'" ||c == "<" || c == "=" || c == "`" ){

    } else if(c == EOF){
       
    } else{
         currentAttribute.value += c;
         return UnquotedAttributeValue;
    }
}


function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

//自结束标签状态
function selfClosingStartTag(c){
    if(c == ">"){
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    }else if(c == EOF){
        
    }else{

    }
}

//标签关闭状态
function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type:"endTag",
            tagName:""
        }
        return tagName(c);
    }else if(c == ">"){

    }else if(c == EOF){

    }else{

    }
}


//负责分发状态
function data(c) {
    if (c == "<") {
        return tagOpen;
    } else if(c == ">"){
        return endTagOpen;
    } else if (c == EOF) {
        emit({
            type: "EOF"
        });
        return;
    } else {
        emit({
            type: "text",
            content: c
        });
        return data;
    }
}

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for (let c of html) {
        state = state(c);
    }

    state = state(EOF);
    return stack[0];
}
 