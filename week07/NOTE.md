#第七周 学习总结

第一部分： 完成toy-brower
主轴（Main Axis)和交叉轴(Cross Axis)

主轴方向： flex-direction: row / column

主轴： 元素的排布方向
交叉轴：主轴的垂直方向

弹性布局：
针对容器，增加布局
.box{
   display: flex; 
}

行内元素：
.box{
    display:inline-flex;
}

webkit浏览器
.box{
    display:-webkit-flex;
}

容器的属性：
1.flex-direction:
    决定主轴的方向
    1.1 row (默认值)：主轴为水平方向，起点在左端
    1.2 row-reverse：主轴为水平方向，起点在右端
    1.3 column：主轴为垂直方向，起点在上沿
    1.4 column-reverse:主轴为垂直方向，起点在下沿

2.flex-wrap:
    换行属性
    2.1 nowrap:不换行
    2.2 wrap：换行 从上往下排
    2.3 wrap-reverse: 换行，从下往上排

3.flex-flow:
    flex-flow属性是flex-direction属性和flex-wrap属性的简写形式，默认值为row nowrap。

4.justify-content：
    项目在主轴上的对齐方式 
    4.1 flex-start 左对齐
    4.2 flex-end   右对齐
    4.3 center     居中对齐
    4.4 space-between  两端对齐，项目之间间距相等
    4.5 space-around   每个项目的两侧相等

5.align-items:
    定义项目在交叉轴上如何对齐
    5.1 flex-start 交叉轴起点对齐
    5.2 flex-end   交叉轴终点对齐
    5.3 center     交叉轴中点对齐
    5.4 baseline   项目的第一行文字的基线对齐
    5.5 stretch(默认值)   如果项目未设置高度或为auto，将占满整个容器的高度


6.align-content:
    align-content属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。
    6.1 flex-start: 与交叉轴的起点对齐  
    6.2 flex-end: 与交叉轴的终点对齐
    6.3 center:与交叉轴的中点对齐
    6.4 space-between:与交叉轴两端对齐，轴线之间的间隔平均分布
    6.5 space-around:每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍
    6.6 stretch(默认值)：轴线占满整个交叉轴


项目的属性：
1.order：
    order属性定义项目的排列顺序。数值越小，排列越靠前，默认为0。
2.flex-grow：
    flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。
3.flex-shrink：
    flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。
4.flex-basis：
    flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。
    浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。
5.flex：
    flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto。后两个属性可选。
6.align-self：
    align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。
    默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch



第二部分：重学CSS
第一步  CSS语法研究

第二部 CSS @规则的研究
 
第三部 CSS规则的结构

第四部  初见CSS体系