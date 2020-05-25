# 第六周学习总结
第一部分：有限状态机处理字符串
	特点：
	1.每一个状态都是一个机器
		1.1 在每一个机器里，我们可以做计算，存储，输出
		1.2 所有的这些机器接收的输入都是一样的
		1.3 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，它应该是纯函数
	2.每一个机器知道下一个状态
		2.1 每个机器都有确定的下一个状态（Moore)
		2.2 每个机器根据输入决定下一个状态（Mealy）
	
	常用结构：
	//每个函数是一个状态
	function state(input) //函数参数就是输入
	{
		//在函数中可以自由地编写代码，处理每个状态的逻辑
		return next;//返回值作为下一个状态
	}
	
	/////////调用方法//////////
	while(input){
		//获取输入
		state = state(input);//把状态机的返回作为下一个状态
	}
	
第二部分： 浏览器解析过程
	整体流程：
	通过URL发送HTTP请求->解析服务器返回的html->生成	DOM树，并计算CSS属性->生成带Css的DOM树->计算元素位置->页面渲染
	
	解析html的方法:
	1.拆分文件
	2.创建状态机
	3.解析标签
	4.创建元素
	5.处理属性
	6.构建dom树
	7.文本节点
	
	计算css方法：
	1.收集css规则
	2.添加调用
	3.获取父元素序列
	4.拆分选择器
	5.计算选择器与元素匹配
	6.生成computed属性
	7.确定规则覆盖关系
	
知识点整理：
	1. for of 和 for in的区别
		for in:
			一般用于遍历对象的可枚举属性。以及对象从构造函数原型中继承的属性。对于每个不同的属性，语句都会被执行。
			不建议使用for in 遍历数组，因为输出的顺序是不固定的。
			如果迭代的对象的变量值是null或者undefined, for in不执行循环体，建议在使用for in循环之前，先检查该对象的值是不是null或者undefined
		for of:
			1.for…of 语句在可迭代对象（包括 Array，Map，Set，String，TypedArray，arguments 对象等等）上创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句
			
	2.数组的基础操作（pop，pushd，slice，reverse)
	
	3.css样式优先级
	count 1 if the declaration is from is a 'style' attribute rather than a rule with a selector, 0 otherwise (= a) (In HTML, values of an element's "style" attribute are style sheet rules. These rules have no selectors, so a=1, b=0, c=0, and d=0.)
	count the number of ID attributes in the selector (= b)
	count the number of other attributes and pseudo-classes in the selector (= c)
	count the number of element names and pseudo-elements in the selector (= d)
	
	Some examples:
	 *             {}  /* a=0 b=0 c=0 d=0 -> specificity = 0,0,0,0 */
	 li            {}  /* a=0 b=0 c=0 d=1 -> specificity = 0,0,0,1 */
	 li:first-line {}  /* a=0 b=0 c=0 d=2 -> specificity = 0,0,0,2 */
	 ul li         {}  /* a=0 b=0 c=0 d=2 -> specificity = 0,0,0,2 */
	 ul ol+li      {}  /* a=0 b=0 c=0 d=3 -> specificity = 0,0,0,3 */
	 h1 + *[rel=up]{}  /* a=0 b=0 c=1 d=1 -> specificity = 0,0,1,1 */
	 ul ol li.red  {}  /* a=0 b=0 c=1 d=3 -> specificity = 0,0,1,3 */
	 li.red.level  {}  /* a=0 b=0 c=2 d=1 -> specificity = 0,0,2,1 */
	 #x34y         {}  /* a=0 b=1 c=0 d=0 -> specificity = 0,1,0,0 */
	 style=""          /* a=1 b=0 c=0 d=0 -> specificity = 1,0,0,0 */
	<HEAD>
	<STYLE type="text/css">
	  #x97z { color: red }
	</STYLE>
	</HEAD>
	<BODY>
	<P ID=x97z style="color: green">
	</BODY>
	