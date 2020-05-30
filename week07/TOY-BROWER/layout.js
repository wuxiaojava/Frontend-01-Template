function getStyle(element){
    if(!element.style){
        element.style = {};
    }

    for(let prop in element.computeStyle){
        var p = element.computeStyle.value;
        // console.log(element.computeStyle[prop]);
        var propValue = element.computeStyle[prop];
        element.style[prop] = propValue;

        if(element.style[prop].toString().match(/px$/)){
            element.style[prop] = parseInt(element.style[prop]  );
        }
        
        if (element.style[prop].toString().match(/[0-9.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    // console.log("style:"+element.style);
    return element.style;
}


function layout(element){
    var elementStyle = getStyle(element);
    
    if(elementStyle.display != 'flex'){
        return;
    }

    var items = element.children.filter(e => e.type === "element");

    items.sort(function(a,b){
        return (a.order || 0) - (b.order || 0);
    });

    var style = elementStyle;

    ['width','height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === ''){
            style[size] = null;
        }
    });

    //设计几个属性的默认值
    //默认横向，从左到右
    if (!style.flexDirection || style.flexDirection === "auto"){
        style.flexDirection = "row";
    }

    //主轴占满？
    if (!style.alignItems || style.alignItems === "auto") {
        style.justifyContent = "stretch";
    }

    //主轴元素左对齐
    if (!style.justifyContent || style.justifyContent === "auto") {
        style.justifyContent = "flex-start";
    }

    //默认换行
    if (!style.flexWrap || style.flexWrap === "auto") {
        style.flexWrap = "wrap";
    }

    //轴线占满整个交叉轴
    if (!style.alignConent || style.alignConent === "auto") {
        style.alignConent = "stretch";
    }

    //声明与布局相关的变量
    var mainSize,mainStart,mainEnd,mainSign,mainBase,//主轴相关  mainBase 主轴上从左到右方向 mainSigniS
        crossSize,crossStart,crossEnd,crossSign,crossBase;//交叉轴相关

    //主轴方向为横向，从左到右排列方向
    if(style.flexDirection === "row"){
        mainSize = "width";//主轴Size为元素的width
        mainStart = "left";//主轴方向从左到右,start为lef
        mainEnd = "right";//end为right
        mainSign = "+1";//方向 从左到右 +1
        mainBase = 0;

        crossSize = "height";//交叉轴Size为元素的height
        crossStart = "top";//交叉轴从上到下，start为top
        crossEnd = "bottom"//end 为bottom
    }else if(style.flexDirection === "row-reserve"){
        mainSize = "width"; //主轴Size为元素的width
        mainStart = "right"; //主轴方向从右到左,start为right
        mainEnd = "left"; //end为left
        mainSign = "-1"; //方向 从右到左 -1
        mainBase = style.width;

        crossSize = "height"; //交叉轴Size为元素的height
        crossStart = "top"; //交叉轴从上到下，start为top
        crossEnd = "bottom" //end 为bottom
    } else if (style.flexDirection === "column") {
        mainSize = "height"; //主轴Size为元素的height
        mainStart = "top"; //主轴方向从上到下,start为top
        mainEnd = "bottom"; //end为bottom
        mainSign = "+1"; //方向 从上到下
        mainBase = 0;

        crossSize = "width"; //交叉轴Size为元素的width
        crossStart = "left"; //交叉轴从左到右，start为left
        crossEnd = "right" //end 为right
    } else if (style.flexDirection === "column-revers") {
        mainSize = "height"; //主轴Size为元素的height
        mainStart = "bottom"; //主轴方向从下到上,start为bottom
        mainEnd = "top"; //top
        mainSign = "-1"; //方向 从下到上
        mainBase = style.height;

        crossSize = "width"; //交叉轴Size为元素的width
        crossStart = "left"; //交叉轴从上到下，start为left
        crossEnd = "right" //end 为right
    }
    

    //判断flexWrap是否为从下往上排,如果是，则更改交叉轴的方向相关的属性
    if(style.flexWrap === "wrap-reverse"){
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        //?crossBase未定义
        crossSign = -1;
    }else{
        crossBase = 0;
        crossSign = +1;
    }

    var isAutoMainSize = false;

    if(!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for(var i = 0; i < items.length; i++){
            var item = items[i];
            if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }

    var flexLine = [];
    var flexLines = [flexLine];

    var mainSpace = elementStyle[mainSize];
    var crossSpace = 0;

    //compute Axis 遍历当前元素的子元素
    for(var i = 0 ; i < items.length; i++){
        var item = items[i];
        var itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null){
            itemStyle[mainSize] = 0;
        }

        if(itemStyle.flex){
            flexLine.push(item);
        }else if(style.flexWrap === "nowrap" && isAutoMainSize){
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] != null && itemStyle[crossSize] != (void 0)){
                crossSpace = Max.max(crossSpace,itemStyle[crossSize]);
            }
            flexLine.push(item);
        }else{
            if(itemStyle[mainSize] > style[mainSize]){
                itemStyle[mainSize] = style[mainSize];
            }
            if(mainSpace < itemStyle[mainSize]){
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = [item];
                flexLine.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            }else{
                flexLine.push(item);
            }
            if(itemStyle[crossSize] !== null &&itemStyle[crossSpace] !== (void 0)){
                crossSpace = Math.max(crossSpace,itemStyle[crossSize]);

            }
            mainSpace = itemStyle[mainSize];
        }
    }

    flexLine.mainSpace = mainSpace;

    if(style.flexWrap === "nowrap" || isAutoMainSize){
        flexLine.crossSpace = (style[crossSize] != undefined) ? style[crossSize] : crossSpace;
    }else{
        flexLine.crossSpace = crossSpace;
    }

    if(mainSpace < 0){
        var scale = style[mainSize] / (style[mainSize] - mainSpace);
        var currentMain = mainSize;

        for(var i = 0; i < items.length; i++){
            var item = items[i];
            var itemStyle = getStyle(item);

            if(item.flex){
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale;

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    }else{
        //process each flex line
        flexLines.forEach(function(items){
            var mainSpace = items.mainSpace;
            var flexTotal = 0;

            for(var i = 0 ; i < items.length ; i++){
                var item = items[i];
                var itemStyle = getStyle(item);

                if((itemStyle.flex != null)&&(itemStyle.flex !== (void 0))){
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }

            if(flexTotal > 0){
                var currentMain = mainBase;
                for(var i = 0 ; i < item.length;i++){
                    var item = items[i];
                    var itemStyle = getStyle(item);

                    if (itemStyle.flex){
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex; 
                    } 

                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            }else{
                if(style.justifyContent === "flex-start"){
                    var currentMain = mainBase;
                    var step = 0;
                } else if(style.justifyContent === "flex-end"){
                    var currentMain = mainSpace * mainSign * mainBase;
                    var step = 0;
                } else if (style.justifyContent === "center") {
                    var currentMain = mainSpace / 2 * mainSign + mainBase;
                    var step = 0;
                } else if (style.justifyContent === "space-between") {
                    var step = mainSpace / (items.length - 1) * mainSign;
                    var currentMain = mainBase;
                } else if (style.justifyContent === "space-arround") {
                    var step = mainSpace / items.length * mainSign;
                    var currentMain = step / 2 + mainBase;
                }

                for(var i = 0 ;i < items.length ;i++){
                    var item = items[i];
                    itemStyle[mainStart,mainEnd];
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign + itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        });
    }

    var crossSpace;

    if(!style[crossSize]){
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for(var i = 0; i < flexLines.length;i++){
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSize;
        }
    }else{
        crossSpace = style[crossSize];
        for(var i = 0 ;i < flexLines.length; i++){
            crossSpace -= flexLines[i].crossSpace;
        }
    }

    if(style.flexWrap === "wrap-reverse"){
        crossBase = style[crossSize];
    }else{
        crossBase = 0;
    }

    var lineSize = style[crossSize] / flexLines.length;
    var step;
    if(style.alignConent === "flex-start"){
        crossBase += 0;
        step = 0;
    }
    if (style.alignConent === "flex-end") {
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if (style.alignConent === "center") {
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }
    if (style.alignConent === "space-between") {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if (style.alignConent === "space-around") {
        step = crossSpace / (flexLines.length);
        crossBase += crossSign * step / 2;
    }
    if (style.alignConent === "stretch") {
        crossBase += 0;
        step = 0;
    }

    flexLines.forEach(function(items){
        var lineCrossSize = style.alignConent === 'stretch' ? items.crossSpace + crossSpace / flexLines.length : items.crossSpace;

        for(var i = 0 ; i < items.length ; i++){
            var item = items[i];
            var itemStyle = getStyle(item);

            var align = itemStyle.alignSelf || itemStyle.alignItems;

            if(itemStyle[crossSize] === null){
                itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0;
            }

            if(align === 'flex-start'){
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }

            if (align === 'flex-end') {
                itemStyle[crossStart] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossEnd] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
            }

            if (align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }

            if (align === 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize);

                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossEnd]);
            }
        }

        crossBase += crossSign * (lineCrossSize + step);
    });

}

module.exports = layout