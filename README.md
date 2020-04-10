# Electron学习笔记

## 安装

```bash
npm install electron -g  		 //全局安装
npm install electron --save  	 //项目本地安装	
```

## 创建主入口

```js
|-- main.js                           //入口文件
|-- index.html                        // 首页主进程的显示页面
|-- package.json                      // 不解释了
```

main.js

```js
var electron = require('electron')  //引入electron模块
var app = electron.app   // 创建electron引用
var BrowserWindow = electron.BrowserWindow;  //创建窗口引用

var mainWindow = null ;  //声明要打开的主窗口
app.on('ready',()=>{
    mainWindow = new BrowserWindow({
        width:400,
        height:400
        webPreferences:{ nodeIntegration:true} //如果要开启渲染进程新窗口要设置这个
    })   //设置打开的窗口大小

    mainWindow.loadFile('index.html')  //加载那个页面

    //监听关闭事件，把主窗口设置为null
    mainWindow.on('closed',()=>{
        mainWindow = null
    })
})
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<h2>主进程</h2>
<input type="button" value="开启渲染进程" id="btn">

<script>
    //主进程开启渲染进程新窗口
    const btn = document.querySelector('#btn')                
    const BrowserWindow =require('electron').remote.BrowserWindow

    window.onload = function(){
        btn.onclick = ()=>{

            newWin = new BrowserWindow({
                width:500,
                height:500,
            })
            newWin.loadFile('second.html')
            newWin.on('close',()=>{win=null})

        }
    }
</script>
</body>
</html>
```

## 设置头部菜单

```js
const { Menu } = require('electron')

var template = [
    {
        label:'菜单名称一',
        accelerator:`ctrl+n` //绑定快捷键
        submenu:[
            {label:'菜单一子菜单1',
            //主要代码--------------start 创建新窗口
                click:()=>{
                    win = new BrowserWindow({
                        width:500,
                        height:500,
                        webPreferences:{ nodeIntegration:true}
                    })
                    win.loadFile('yellow.html')
                    win.on('closed',()=>{
                        win = null
                    })

                }
                //主要代码----------------end
            },
            {label:'菜单一子菜单2'}
        ]

    },
    {
        label:'菜单名称二',
        submenu:[
            {label:'菜单二子菜单1'},
            {label:'菜单二子菜单2'}
        ]
    }
]

var m = Menu.buildFromTemplate(template)

Menu.setApplicationMenu(m)
```

然后再打开主进程`main.js`文件，直接加入下面的代码，就可以实现自定义菜单了。或者直接写在main.js中

```js
 require('./main/menu.js')
```

## 右键菜单&外部浏览器打开链接

这里把右键菜单和外部浏览器打开链接放在一起写，是因为都是写在html的script部分的，哪个页面要就写

但是建议封装起来，要用的时候导入比较好

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

<h2>主进程</h2>
<input type="button" value="开启渲染进程" id="btn">
<h1>
    <a id="aHref" href="http://zhuxf.net">watterson的博客</a>
</h1>

<script>
//点击打开新窗口
    const btn = document.querySelector('#btn')
    const BrowserWindow =require('electron').remote.BrowserWindow

    window.onload = function(){
        btn.onclick = ()=>{

            newWin = new BrowserWindow({
                width:500,
                height:500,
            })
            newWin.loadFile('second.html')
            newWin.on('close',()=>{win=null})
        }
    }


//右键菜单（建议封装）
    const {remote,Menu} = require('electron')

    var rigthTemplate = [
        {label:'粘贴'},
        {label:'复制'}
    ]

    var m = remote.Menu.buildFromTemplate(rigthTemplate)

    window.addEventListener('contextmenu',function(e){

        //阻止当前窗口默认事件
        e.preventDefault();
        //把菜单模板添加到右键菜单
        m.popup({window:remote.getCurrentWindow()})

    })


//使用外部浏览器打开页面，利用electron-shell

    var { shell } = require('electron')

    var aHref = document.querySelector('#aHref')

    aHref.onclick = function(e){
        e.preventDefault()
        var href = this.getAttribute('href')
        shell.openExternal(href)
    }

</script>
</body>
</html>
```

## 在主进程中用BrowserView嵌入网页

打开根目录下打开`main.js`,直接引入并使用`BrowserView`就可以实现键入网页到应用中。

```js
var BrowserView = electron.BrowserView //引入BrowserView
var view = new BrowserView()   //new出对象
mainWindow.setBrowserView(view)   // 在主窗口中设置view可用
view.setBounds({x:0,y:100,width:1200, height:800})  //定义view的具体样式和位置
view.webContents.loadURL('https://jspang.com')  //wiew载入的页面
```

这个使用起来非常简单，写完上面的代码，就可以在终端中输入一下`electron .`，运行程序，测试一下效果了。

## 用window.open打开子窗口

我们以前使用过`BrowserWindow`,这个是有区别的，我们通常把`window.open`打开的窗口叫做子窗口。 在`demo3.html`中，加入一个按钮，代码如下：

```js
 <button id="mybtn" >打开子窗口</button> 
```

然后打开`demo3.js`,先获取`button`的DOM节点，然后监听onclick事件，代码如下：

```js
var mybtn = document.querySelector('#mybtn')

mybtn.onclick = function(e){

    window.open('http://zhuxf.net')
}
```

这样就完成了子窗口的打开。这节课的内容也不多，就是讲解一些经常使用api，我们下节课接续讲解。

## Electron 选择文件对话框

我们先来看一下打开对话框的相关API，打开文件选择对话框可以使用`dialog.showOpenDialog()`方法来打开，它有两个参数，一个是设置基本属性，另一个是回调函数，如果是异步可以使用`then`来实现。

- title ： String (可选)，对话框的标题
- defaultPath ： String (可选),默认打开的路径
- buttonLabel ： String (可选), 确认按钮的自定义标签，当为空时，将使用默认标签
- filters ： 文件选择过滤器，定义后可以对文件扩展名进行筛选
- properties：打开文件的属性，比如打开文件还是打开文件夹，甚至是隐藏文件。

对基本的API了解以后，就可以写代码看看具体的效果了。

当我们选择到了一个文件后，`showOpenDialog`提供了回调函数，也就是我们的第二个参数。现在来看一下回调函数如何获得图片路径。

```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <button id="openBtn">打开文件</button>
    <img id="images"  style="width:100%" />
</body>

<script>
    const {dialog} = require('electron').remote
    var openBtn = document.getElementById('openBtn');
    openBtn.onclick = function(){
        dialog.showOpenDialog({
            title:'请选择你喜欢照片',
            //defaultPath:'',
            buttonLabel:'打开图片',
            filters:[{name:'image',extensions:['jpg']}]
        }).then(result=>{
            let image = document.getElementById('images')
            image.setAttribute("src",result.filePaths[0]);
            console.log(result)
        }).catch(err=>{
            console.log(err)
        })
    }

</script>

</html>
```

这样完成了选择照片，并显示在界面上的功能，有的小伙伴这时候就会问了，我用html的选择文件也可以实现这个效果，确实是可以实现的，但我认为既然用了Electron就最好使用原生的形式打开。

## Electron 消息对话框的操作

打开文件对话框和保存文件对话框我们都学习过了，这节学习一下最为普通的消息对话框`dialog.showMessageBox()`，他的属性还是比较多的，所以我们先来看一下他的相关属性。

它有太多的属性，这里我们也只挑一些常用的属性来讲解，如果你在工作中具体使用，可以先到官网查询相关的API后，再根据需求具体使用。

- type ：String类型，可以选，图标样式，有`none`、`info`、`error`、`question`和`warning`
- title: String类型，弹出框的标题
- messsage : String 类型，必选 message box 的内容，这个是必须要写的
- buttons: 数组类型，在案例中我会详细的讲解，返回的是一个索引数值（下标）

[制作一个确认对话框](https://jspang.com/detailed?id=62#toc349)

先在`Demo4.html`中增加一个按钮。

```js
 <button id="messageBtn">弹出对话框</button>
```

然后这个对话框的内容也非常简单，就是简单的弹出一句话，用户可以点击“确定”或者“取消”。代码如下：

```js
var messageBtn = document.getElementById('messageBtn')
    messageBtn.onclick = function(){
        dialog.showMessageBox({
            type:'warning',
            title:'警告',
            message:'是否离开页面',
            buttons:['是','否']
        }).then(result=>{
            console.log(result)
        })
    }
```

可以看到回调中`result`里有一个`response`这个里会给我们返回按钮的数组下标。

为什么会鼓励使用`showMessageBox`，因为这样比JS里的`alert`更加灵活,比如可以设置按钮，可以设置title。最常用的对话框就是这三种了，当然还有两个不常用的，我在这里就不讲了。

## 传统的报错提示框

```js
var messageBtn = document.getElementById('messageBtn')
  messageBtn.onclick = function(){
    dialog.showErrorBox("title", "content")
 }
```

## 打包

在package.json中添加  package

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "package": "electron-packager ./ myapp --out ./OutApp --all --overwrite --icon=./knife.ico"
},
```

``` shell
在根目录下新建OutApp文件夹

npm run package
```

注意electron要在开发模式安装--save-dev

> **./ myapp：软件名**
>
> **--out ./OutApp：输出路径**
>
> **--all：全平台**
>
> **--icon=./knife.ico"：图标**

其中--platform是配置打包成什么平台的安装文件，下面是可选的值

- win系统：--platform=win32
- mac系统：--platform=darwin
- Linux系统：--platform=linux
- 所有平台：--platform=all

其中--arch是指定系统是什么架构的，常见的例如32位和64位操作系统，这个参数的可选值有

- ia32， 即--arch=ia32， 32位操作系统，也可以在64位操作系统中安装
- x64， 即--arch=x64， 64位操作系统，使用本架构打包无法再32位操作系统中安装
- armv7l， 即--arch=armv7l， 使用比较少
- arm64， 即--arch=arm64， 使用比较少

参数--platform和--arch已经被标志为过期



