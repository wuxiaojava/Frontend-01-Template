第八周：学习笔记
20200528
一.选择器语法：
1.简单选择器：
 1.1 * 选择所有元素 universial selector
 1.2 div   标签选择器  svg|a  namespace 命名空间  默认html命名空间  svg的a 和html的a  
 1.3 .cls 类选择器 .cls1 .cls2  属性选择器特例
 1.4 #id 完全匹配
 1.5 [attr=value]  attr|  attr~   attr 不写属性
 1.6 :hover 伪类选择器
 1.7 ::before 伪元素选择器  ：也可以

2.复合选择器
 2.1<简单选择器><简单选择器><简单选择器>  同时match
 2.2 * 或者 div 必须写在最前面
 2.3 伪类和伪元素必须卸载最后

3.复杂选择器
  3.1 <符合选择器><sp><符合选择器> 子孙选择器 
  3.2 <符合选择器>">"<符合选择器> 子选择器 只能选择下一级
  3.3 <符合选择器>"~"<符合选择器>  邻居 后继
  3.4 <符合选择器>"+"<符合选择器>  邻居 直接后继
  3.5 <符合选择器>"||"<符合选择器> table里选中一列

4.选择器列表
    带“，”

二.选择器优先级：
简单选择器技术：
[0,0,0,0] 同一个选择器进行计算：
第一位：inline-style
第二位：# 
第三位：.  属性选择器[attr=value]
第四位：div
1.行内
2.id选择器
练习：
div#a.b .c[id=x]   [0,1,3,1]
#a:not(#b)         [0,2,0,0]  not 不参与优先级计算
*.a                [0,0,1,0]
div.a              [0,0,1,1]

优先级一致，覆盖

三.伪类：
链接/行为
:any-link 所有链接 有href属性 图片里的area
:link 没访问过的 :visited 访问过的

:hover 鼠标悬停 
:active 动作 激活 
:focus 焦点事件
:target #后面的href  目标target  新


树形结构：
:empty
:nth-child()
:nth-last-clild()
:first-child :last-child :only-child

逻辑型：
:not
:where :has

四.伪元素：
::before 元素内容之前 产生新盒
::after  元素内容之后 产生新盒
<div>
<::before>
    content content content content
    content content content content
    content content content content
    content content content content
<::after>
</div>

::letter

::first-line （排版的第一行）
<div>
<::first-line>content content content </::first-line>

</div>


作业(正则)：
//检查element是否能被selector选中
function match(selector,element){
    return true;
}

match("div#id.class",document.getElementById(id"));

20200530
源代码：标签
语义：元素
表现：盒

排版盒渲染的基本单位是盒

产生多盒的场景
1.inline元素分行，会产生多个盒
2.有伪元素产生多盒

一.盒模型：
盒：四层 从里到外
layout-widht  layout-height
box-sizing:width表示什么宽度   content-box    border-box
1.content  width
2.padding 
3.border 边框
4.margin 留白

二.正常流
1.收集盒进行
2.计算盒在行中的排布
3.计算行的排布

Flex排版
1.收集盒进行
2.计算盒在主轴方向的排布
3.计算盒在交叉轴的排布

正常流的行模型(ifc inline formating content)

正常流三大难题：
1.float与clear

2.margin 折叠

3.overflow:visble; bfc

FreeType 字体

参考名词：
IFC：inline formatting context
BFC：block formatting context
Tips：
大家请记住下面这个表现原则：如果一个元素具有 BFC，内部子元素再怎么翻江倒海、翻云覆雨，都不会影响外部的元素。所以，BFC 元素是不可能发生 margin 重叠的，因为 margin 重叠是会影响外部的元素的；BFC 元素也可以用来清除浮动的影响，因为如果不清除，子元素浮动则父元素高度塌陷，必然会影响后面元素布局和定位，这显然有违 BFC 元素的子元素不会影响外部元素的设定。
block-level 表示可以被放入 bfc
block-container 表示可以容纳 bfc
block-box = block-level + block-container
block-box 如果 overflow 是 visible， 那么就跟父 bfc 合并 