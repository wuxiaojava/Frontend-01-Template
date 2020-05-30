//引入第三方插件 用来生成css结构
const css = require("css");

//引入layout插件，进行布局相关操作
const layout = require("./layout");

//定义 文件结束 标记
const EOF = Symbol("EOF");//end of file 

//定义当前token
let currentToken = null;

//定义当前token的属性对象
let currentAttribute = null;

//定义documentTag 
var documentTag = { tagName:"document",type: "document", children: [] };
// console.log(`元素栈初始化`);
//定义数组，模拟栈操作 默认放入document元素进站
let stack = [documentTag];

// console.log(`元素 <${documentTag.tagName}> 进栈 `);
// console.log(`当前元素栈大小为： ${stack.length}`);
// console.log(`当前栈顶元素： <${stack[stack.length-1].tagName}>`);
//定义当前文本节点
let currentTextNode = null;

//加入一个新的函数 addCSSRules,这里我们把css规则暂存到一个数组里
let rules = [];

//收集CSS rules
function addCSSRules(text){
    //调用第三方css插件，生成css ast(抽象语法树)
    var ast = css.parse(text);
    // console.log("css ast:");
    // console.log(JSON.stringify(ast,null,"    "));
    rules.push(...ast.stylesheet.rules);
}

//元素与css样式选择器进行匹配
//匹配简单选择器是否与当前元素匹配
function match(element, selector) {
    //如果选择器为空或元素属性为空，则返回匹配失败
    if(!selector || !element.attributes){
       return false;
    } 
    
    //id选择器
    if(selector.charAt(0) == "#"){
        //获取当前元素的id属性
        var attr = element.attributes.filter(attr => attr.name === "id")[0];
        if(attr && attr.value === selector.replace("#",'')){
            return true;
        }
    }else if(selector.charAt(0) == "."){
        //类选择器
        var attr = element.attributes.filter(attr => attr.name === "class")[0];
        if (attr && attr.value === selector.replace(".", '')) {
            return true;
        }
    }else{
        //标签选择器
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
    //array slice   浅拷贝  按照需求赋值一份数组，可制定赋值的范围
    //array reverse 数组倒序 (上级元素数组)
    var elements = stack.slice().reverse();
    
    //如果当前元素没有computeStyle属性对象，则初始化一个空对象
    if(!element.computeStyle){
        element.computeStyle = {};
    }

    //rules已经收集完成(style标签在之前已经解析完成)
    //遍历rule规则
    for(let rule of rules){
        //将selector进行拆分，反序   #container .cls => [.cls,container]
        var selectorParts = rule.selectors[0].split(" ").reverse();

        console.log(`复合选择器数组倒序后，第一个选择器为：`)
        console.log(`当前待匹配选择器 ${rule.selectors[0]}`);

        
        //******** 此处只考虑简单选择器组成的复杂选择器，未考虑复合选择器组成的复杂选择器 **** */
        //检查简单选择器是否 能匹配当前元素
        console.log(`匹配元素${element.tagName} 和样式 ${selectorParts[0]}`);

        if(!match(element,selectorParts[0])){
            continue;
        }
        
        //记录匹配的层级个数
        var j = 1;

        //从父级元素开始向上级遍历，看看是否满足选择器条件
        for (var i = 0; i < elements.length; i++) {
            console.log(`匹配元素${elements[i].tagName} 和样式 ${selectorParts[j]}`);
            if (match(elements[i], selectorParts[j])) {
                if(j < selectorParts.length - 1 ){
                    j++;
                }
            }
        }
        

        if(j >= selectorParts.length){
            console.log(`选择器个数:${selectorParts.length},j=${j}`);
            matched = true;
        }

        //如果匹配成功 则进行computeStyle的计算
        if(matched){
            //计算当前选择器的优先级
            var sp = specificity(rule.selectors[0]);
            var computeStyle = element.computeStyle;

            for(var declaration of rule.declarations){
                if(!computeStyle[declaration.property]){
                    computeStyle[declaration.property] = declaration.value;
                }
                if (!computeStyle[declaration.property].specificity){
                    computeStyle[declaration.property].value = declaration.value;
                    computeStyle[declaration.property].specificity = sp;
                } else if (compare(computeStyle[declaration.property].specificity,sp) < 0){
                    for(var k = 0; k <4 ; k++){
                        computeStyle[declaration.property][declaration.value][k] += sp[k];
                    }
                }
            }

            console.log(computeStyle);
        }
    }

    if(element.type != 'text'){
        // console.log(element.computeStyle);
    }
    
}

//比较元素的优先级
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

//构造元素队列
/**
 * 
 * @param {词法解析后获取的token对象} token
 * 
 * 栈内元素的结构
 * let element = {
 *      type:"element",//初始化时赋值
 *      children:[],//解析字节点开始标签时赋值
 *      attributes:[
 *          {   
 *              name:attributeName1，
 *              value:attributeValue1
 *          },{
 *              name:attributeName2，
 *              value:attributeValue2
 *          }，{
 *              name:"computeStyle",
 *              value:{
 *                  name1:attributeName1,
 *                  name2:attributeName2
 *              }
 *          }
 *      ]
 * } 
 */
function emit(token){
    let top = stack[stack.length - 1];
    if(token.type == "startTag"){
        //定义一个入栈的元素 默认3个属性
        let element = {
            type:"element",
            children:[],
            attributes:[]
        };

        //给入栈元素增加tagName属性
        element.tagName = token.tagName;

        //遍历token的属性
        for(let p in token){
            //将token的非type属性和tagName属性存到当前元素的attributes属性对象中
            if(p != "type" || p != "tagName"){
                element.attributes.push({
                    name:p,
                    value:token[p]
                });
            }
        }
        //元素标签开始时，获取computeStyle
        computeCSS(element);

        //将元素放到父元素的children属性中
        top.children.push(element);

        //给子元素的parent属性赋值
        element.parent = top;
        //如果当前token不是自结束token，则将当前元素入栈
        
        if(!token.isSelfClosing){
            stack.push(element);
            // console.log(`元素 <${element.tagName}> 入栈`);
            // console.log(`当前栈大小为： ${stack.length}`);
            // console.log(`当前栈顶元素： <${stack[stack.length-1].tagName}>`);
        }

        //当前节点不是文本节点，所以，当前文本结点置为空
        currentTextNode = null;
    }else if(token.type == "endTag"){ 
        //结束token的处理
        //判断当前栈顶元素的tagName与当前处理的token的tagName是否相等
        if(top.tagName != token.tagName){
            console.log("Tag start and doesn't match!");
            //throw new Error("Tag start and doesn't match!");
        }else{
            //遇到style标签时，执行添加Css规则的操作
            if(top.tagName == "style"){
                //收集css规则
                addCSSRules(top.children[0].content);
            }
            //计算栈顶元素的layout
            layout(top);
            //栈顶元素出栈
            stack.pop(); 
            // console.log(`元素 <${top.tagName}> 出栈`);
            // console.log(`当前栈大小为： ${stack.length}`);
            // console.log(`当前栈顶元素： <${stack[stack.length-1].tagName}>`);
        }
        currentTextNode = null;
    } else if (token.type == "text") {
        //处理文本节点
        //如果当前的文本节点为空，则进行初始化
        if(currentTextNode == null){
            //设置默认属性
            currentTextNode = {
                type:"text",
                content:""
            }
            //将文本节点增加到其父节点中
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

//引号value结束状态
function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
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

//对外提供解析html的方法
module.exports.parseHTML = function parseHTML(html) {
    //初始化第一个状态机方法为data
    let state = data;

    //遍历html里的元素，进行状态计算，并解析html
    for (let c of html) {
        state = state(c);
    }

    //遍历结束后，设置文档结束状态（EOF）
    state = state(EOF);
    // console.log(`栈操作结束，最终大小为 ${stack.length} `);
    //返回解析后的dom对象
    return stack[0];
}
 