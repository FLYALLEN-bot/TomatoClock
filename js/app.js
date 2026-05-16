/**
 * app.js - 入口文件，组装所有模块
 */
(function() {
  'use strict';

  // 创建 Settings 实例
  const settings = new Settings();

  // 创建 History 实例
  const history = new History();

  // 创建 Chart 实例
  const chart = new TomatoChart('statsChart');

  // 创建 Timer 实例
  const timer = new Timer({
    settings: settings,
    onTick: (remaining, phase) => {
      UI.updateTimer(remaining, phase);
      const state = timer.getState();
      UI.updateProgress(remaining, state.duration);
    },
    onPhaseComplete: (completedPhase) => {
      const timerState = timer.getState();
      const settingsData = settings.getAll();

      // 添加历史记录
      if (completedPhase === 'work') {
        history.add({
          focusDuration: settingsData.workDuration,
          breakDuration: settingsData.shortBreakDuration
        });
      }

      // 显示通知
      NotificationModule.alert(completedPhase);

      // 刷新历史记录和图表
      UI.renderHistory();
    },
    onStateChange: (newState) => {
      UI.updateButtons(newState.state);
      UI.updateTimer(newState.remaining, newState.phase);
      UI.updateProgress(newState.remaining, newState.duration);
      UI._updatePhaseIndicator(newState.completedPomodoros);

      // 更新页面标题
      if (newState.state === 'running') {
        const minutes = Math.floor(newState.remaining / 60);
        const seconds = newState.remaining % 60;
        document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - 番茄钟`;
      } else {
        document.title = '番茄钟 · Tomato Clock';
      }
    }
  });

  // 连接 Settings onChange 到 Timer
  settings.onChange = (newSettings) => {
    timer.updateSettings(newSettings);
    UI.updateTimer(timer.getState().remaining, timer.getState().phase);
  };

  // 初始化 UI
  UI.init(timer, settings, history, chart, NotificationModule);

  // 初始化通知
  NotificationModule.init().then(granted => {
    if (!granted) {
      console.log('通知权限未授予，将仅使用声音提醒');
    }
  });

  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker 注册失败:', error);
      });
  }
})();
