# 🍅 番茄钟 - Tomato Clock

一个基于 Web 的番茄钟应用，采用可爱卡通风格界面，支持计时、历史记录和统计图表功能。

## ✨ 功能特性

- ⏱️ **番茄钟计时** - 支持开始、暂停、继续、跳过操作
- 🎛️ **自定义设置** - 灵活调整工作/休息时长和长休息触发数
- 🔔 **声音提醒** - 番茄钟结束时播放"叮咚"提示音（Web Audio API）
- 📢 **浏览器通知** - 支持桌面通知提醒
- 📊 **历史记录** - 按日期分组查看完成记录
- 📈 **统计图表** - 每日/每周/每月番茄钟数量折线图和柱状图
- ⌨️ **键盘快捷键** - 空格键暂停/继续，S 键跳过
- 💾 **本地存储** - 数据保存在浏览器 localStorage，隐私安全
- 📱 **PWA 支持** - 可安装到主屏幕，支持离线使用
- 🎨 **可爱卡通风格** - 温馨柔和的配色，圆润可爱的界面

## 🚀 快速开始

### 直接打开

只需用浏览器打开 `index.html` 即可使用：

```bash
# 克隆项目
git clone https://github.com/你的用户名/TomatoClock.git
cd TomatoClock

# 直接用浏览器打开
open index.html    # macOS
start index.html   # Windows
xdg-open index.html # Linux
```

### 本地服务器（推荐，支持 PWA）

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .

# 然后访问 http://localhost:8080
```

## 📖 使用说明

### 基本操作

1. 点击 **开始** 按钮启动番茄钟计时（默认 25 分钟）
2. 工作时间结束后自动进入短休息（默认 5 分钟）
3. 每完成 4 个番茄钟后进入长休息（默认 15 分钟）
4. 在设置面板中可自定义各项时长

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `空格` | 暂停 / 继续计时 |
| `S` | 跳过当前阶段 |

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript (ES6+)** - 业务逻辑
- **Chart.js** - 图表渲染
- **Web Audio API** - 提示音合成
- **Service Worker** - 离线缓存（PWA）
- **LocalStorage** - 数据持久化

## 📁 项目结构

```
TomatoClock/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 入口，组装模块
│   ├── timer.js        # 计时器逻辑
│   ├── settings.js     # 设置管理
│   ├── storage.js      # 本地存储封装
│   ├── history.js      # 历史记录管理
│   ├── chart.js        # 图表渲染
│   ├── notification.js # 声音和通知
│   └── ui.js           # DOM 操作和事件绑定
├── assets/
│   └── images/         # 图标资源
├── manifest.json       # PWA 配置
├── sw.js               # Service Worker
└── README.md
```

## ⚙️ 可配置项

| 参数 | 默认值 | 范围 |
|------|--------|------|
| 工作时长 | 25 分钟 | 1-60 分钟 |
| 短休息时长 | 5 分钟 | 1-30 分钟 |
| 长休息时长 | 15 分钟 | 1-60 分钟 |
| 长休息触发数 | 4 个番茄钟 | 1-10 个 |

## 🌐 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 许可证

MIT License
