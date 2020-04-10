const { Menu } = require('electron')
var electron = require('electron')

var app = electron.app

var BrowserWindow = electron.BrowserWindow;

var mainWindow = null ;

app.on('ready',()=>{
    mainWindow = new BrowserWindow({
        width:500,
        height:500,
        webPreferences:{ nodeIntegration:true}
    })

    mainWindow.loadFile('./dist/index.html')

    mainWindow.on('closed',()=>{
        mainWindow = null
    })

    // var BrowserView = electron.BrowserView //引入BrowserView
    // var view = new BrowserView()   //new出对象
    // mainWindow.setBrowserView(view)   // 在主窗口中设置view可用
    // view.setBounds({x:0,y:100,width:1200, height:800})  //定义view的具体样式和位置
    // view.webContents.loadURL('https://jspang.com')  //wiew载入的页面
})


var template = [
    {
        label:'菜单名称一',
        submenu:[
            {label:'菜单一子菜单1',
                accelerator:`ctrl+n` ,//绑定快捷键
                //主要代码--------------start 创建新窗口
                click:()=>{
                    win = new BrowserWindow({
                        width:500,
                        height:500,
                        webPreferences:{ nodeIntegration:true}
                    })
                    win.loadFile('second.html')
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
