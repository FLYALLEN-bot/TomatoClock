/**
 * UI 模块 - DOM 操作、事件绑定、键盘快捷键
 */
const UI = {
  _timer: null,
  _settings: null,
  _history: null,
  _chart: null,
  _notification: null,
  _currentChartView: 'daily',
  _toastTimeout: null,

  /**
   * 初始化 UI
   */
  init(timer, settings, history, chart, notification) {
    this._timer = timer;
    this._settings = settings;
    this._history = history;
    this._chart = chart;
    this._notification = notification;

    this._bindTimerControls();
    this._bindTabs();
    this._bindSettings();
    this._bindHistory();
    this._bindChartToggle();
    this._bindKeyboard();
    this._bindModal();

    // 初始渲染
    this._renderSettings();
    this.renderHistory();
    this._renderChart();

    // 更新初始状态
    const state = timer.getState();
    this.updateTimer(state.remaining, state.phase);
    this.updateButtons(state.state);
    this.updateProgress(state.remaining, state.duration);
    this._updatePhaseIndicator(state.completedPomodoros);
  },

  /**
   * 更新计时器显示
   */
  updateTimer(remaining, phase) {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    document.getElementById('timerDisplay').textContent = timeStr;

    const phaseLabel = document.getElementById('phaseLabel');
    switch (phase) {
      case 'work':
        phaseLabel.textContent = '工作中';
        phaseLabel.className = 'phase-label';
        break;
      case 'short':
        phaseLabel.textContent = '短休息';
        phaseLabel.className = 'phase-label short';
        break;
      case 'long':
        phaseLabel.textContent = '长休息';
        phaseLabel.className = 'phase-label long';
        break;
    }
  },

  /**
   * 更新按钮状态
   */
  updateButtons(state) {
    const btnStart = document.getElementById('btnStart');
    const btnPause = document.getElementById('btnPause');
    const btnSkip = document.getElementById('btnSkip');

    switch (state) {
      case 'idle':
        btnStart.disabled = false;
        btnStart.textContent = '开始';
        btnPause.disabled = true;
        btnSkip.disabled = true;
        break;
      case 'running':
        btnStart.disabled = true;
        btnPause.disabled = false;
        btnSkip.disabled = false;
        break;
      case 'paused':
        btnStart.disabled = false;
        btnStart.textContent = '继续';
        btnPause.disabled = true;
        btnSkip.disabled = false;
        break;
      case 'completed':
        btnStart.disabled = true;
        btnPause.disabled = true;
        btnSkip.disabled = true;
        break;
    }
  },

  /**
   * 更新进度条
   */
  updateProgress(remaining, duration) {
    const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
    document.getElementById('progressBar').style.width = `${progress}%`;
  },

  /**
   * 渲染历史记录列表
   */
  renderHistory() {
    const grouped = this._history.getGroupedByDate();
    const container = document.getElementById('historyList');

    if (Object.keys(grouped).length === 0) {
      container.innerHTML = '<div class="empty-state">暂无记录</div>';
      return;
    }

    let html = '';
    for (const [date, records] of Object.entries(grouped)) {
      html += `<div class="history-date-group">`;
      html += `<div class="history-date">${this._formatDisplayDate(date)}</div>`;

      for (const record of records) {
        const time = new Date(record.completedAt);
        const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        const phaseText = record.focusDuration === 25 ? '专注' : `${record.focusDuration}分钟`;

        html += `
          <div class="history-item">
            <span class="history-time">${timeStr}</span>
            <span class="history-info">${phaseText} #${record.pomodoroCount}</span>
          </div>`;
      }

      html += `</div>`;
    }

    container.innerHTML = html;
  },

  /**
   * 渲染图表
   */
  _renderChart() {
    switch (this._currentChartView) {
      case 'daily':
        const dailyData = this._history.getDailyCounts(14);
        this._chart.renderDaily(dailyData);
        break;
      case 'weekly':
        const weeklyData = this._history.getWeeklyCounts(8);
        this._chart.renderWeekly(weeklyData);
        break;
      case 'monthly':
        const monthlyData = this._history.getMonthlyCounts(6);
        this._chart.renderMonthly(monthlyData);
        break;
    }
  },

  /**
   * 渲染设置表单
   */
  _renderSettings() {
    const settings = this._settings.getAll();
    document.getElementById('workDuration').value = settings.workDuration;
    document.getElementById('shortBreakDuration').value = settings.shortBreakDuration;
    document.getElementById('longBreakDuration').value = settings.longBreakDuration;
    document.getElementById('pomodorosUntilLongBreak').value = settings.pomodorosUntilLongBreak;
  },

  /**
   * 更新阶段指示器
   */
  _updatePhaseIndicator(completed) {
    const dots = document.querySelectorAll('.phase-indicator .dot');
    const settings = this._settings.getAll();
    const total = settings.pomodorosUntilLongBreak;

    dots.forEach((dot, i) => {
      dot.className = i < completed ? 'dot active' : 'dot';
    });
  },

  /**
   * 显示提示消息
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  /**
   * 格式化显示日期
   */
  _formatDisplayDate(dateStr) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (dateStr === todayStr) {
      return '今天';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateStr === yesterdayStr) {
      return '昨天';
    }

    const parts = dateStr.split('-');
    return `${parts[1]}月${parts[2]}日`;
  },

  // ==================== Event Binding ====================

  /**
   * 绑定计时器控制按钮
   */
  _bindTimerControls() {
    document.getElementById('btnStart').addEventListener('click', () => {
      this._timer.start();
    });

    document.getElementById('btnPause').addEventListener('click', () => {
      this._timer.pause();
    });

    document.getElementById('btnSkip').addEventListener('click', () => {
      this._timer.skip();
    });
  },

  /**
   * 绑定 Tab 切换
   */
  _bindTabs() {
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // 切换 tab 激活状态
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 切换内容
        const targetId = tab.dataset.tab + 'Tab';
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');

        // 刷新图表
        if (tab.dataset.tab === 'chart') {
          this._renderChart();
        }
        if (tab.dataset.tab === 'history') {
          this.renderHistory();
        }
      });
    });
  },

  /**
   * 绑定设置面板
   */
  _bindSettings() {
    document.getElementById('btnSaveSettings').addEventListener('click', () => {
      try {
        const workDuration = parseInt(document.getElementById('workDuration').value);
        const shortBreakDuration = parseInt(document.getElementById('shortBreakDuration').value);
        const longBreakDuration = parseInt(document.getElementById('longBreakDuration').value);
        const pomodorosUntilLongBreak = parseInt(document.getElementById('pomodorosUntilLongBreak').value);

        this._settings.update({
          workDuration,
          shortBreakDuration,
          longBreakDuration,
          pomodorosUntilLongBreak
        });

        this.showToast('设置已保存', 'success');
      } catch (e) {
        this.showToast(e.message, 'error');
      }
    });

    document.getElementById('btnResetSettings').addEventListener('click', () => {
      this._settings.reset();
      this._renderSettings();
      this.showToast('已恢复默认设置', 'info');
    });
  },

  /**
   * 绑定历史记录
   */
  _bindHistory() {
    document.getElementById('btnClearHistory').addEventListener('click', () => {
      document.getElementById('confirmModal').classList.add('active');
    });
  },

  /**
   * 绑定确认弹窗
   */
  _bindModal() {
    document.getElementById('btnConfirmYes').addEventListener('click', () => {
      this._history.clearAll();
      this.renderHistory();
      this._renderChart();
      document.getElementById('confirmModal').classList.remove('active');
      this.showToast('历史记录已清除', 'info');
    });

    document.getElementById('btnConfirmNo').addEventListener('click', () => {
      document.getElementById('confirmModal').classList.remove('active');
    });
  },

  /**
   * 绑定图表切换
   */
  _bindChartToggle() {
    const chartTabs = document.querySelectorAll('.chart-tab');
    chartTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        chartTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._currentChartView = tab.dataset.chart;
        this._renderChart();
      });
    });
  },

  /**
   * 绑定键盘快捷键
   */
  _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // 忽略输入框内的按键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const state = this._timer.getState();

      // 空格键：暂停/继续
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.state === 'running') {
          this._timer.pause();
        } else if (state.state === 'paused' || state.state === 'idle') {
          this._timer.start();
        }
      }

      // S 键：跳过
      if (e.code === 'KeyS') {
        if (state.state === 'running' || state.state === 'paused') {
          this._timer.skip();
        }
      }
    });
  }
};
