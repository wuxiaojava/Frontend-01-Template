const images = require("images");

function render(viewport,element) {
    if(element.style){
        if(element.style["background-color"]){
            console.log(`开始渲染，渲染元素${element.tagName},
        width=${element.style.width},
        height=${element.style.height},
        color=${element.style["background-color"]},
        left=${element.style.left},
        top=${element.style.top}`);
            var img = images(element.style.width, element.style.height);
            let color = element.style["background-color"];
            color.match(/rgb\((\d+),(\d+),(\d+)\)/);
            // console.log(`width:${element.style.width},height:${element.style.height},RegExp.$1=${RegExp.$1};RegExp.$2=${RegExp.$2};RegExp.$3=${RegExp.$3}`);
            img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3),1);
            viewport.draw(img,element.style.left||0,element.style.top||0);
        }
    }

    if(element.children){
        for(var child of element.children){
            render(viewport,child);
        }
    }
}

module.exports = render;