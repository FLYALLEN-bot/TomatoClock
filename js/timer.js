/**
 * Timer 模块 - 核心计时逻辑、状态机、流程控制
 */

const Phase = {
  WORK: 'work',
  SHORT_BREAK: 'short',
  LONG_BREAK: 'long'
};

const State = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

class Timer {
  /**
   * @param {Object} options - 回调函数
   * @param {Function} options.onTick - 每秒回调
   * @param {Function} options.onPhaseComplete - 阶段完成回调
   * @param {Function} options.onStateChange - 状态变化回调
   * @param {Settings} options.settings - Settings 实例
   */
  constructor(options) {
    this._options = options;
    this._settings = options.settings;
    this._state = State.IDLE;
    this._phase = Phase.WORK;
    this._remaining = 0;
    this._completedPomodoros = 0;
    this._startTime = null;
    this._pausedRemaining = null;
    this._intervalId = null;

    this._updateDuration();
    this.restore();
  }

  /**
   * 根据当前设置更新阶段时长
   */
  _updateDuration() {
    const settings = this._settings.getAll();
    switch (this._phase) {
      case Phase.WORK:
        this._duration = settings.workDuration * 60;
        break;
      case Phase.SHORT_BREAK:
        this._duration = settings.shortBreakDuration * 60;
        break;
      case Phase.LONG_BREAK:
        this._duration = settings.longBreakDuration * 60;
        break;
    }
  }

  /**
   * 获取当前状态
   * @returns {{ state: string, phase: string, remaining: number, completedPomodoros: number }}
   */
  getState() {
    return {
      state: this._state,
      phase: this._phase,
      remaining: this._remaining,
      completedPomodoros: this._completedPomodoros,
      duration: this._duration
    };
  }

  /**
   * 开始/继续计时
   */
  start() {
    if (this._state === State.IDLE) {
      this._remaining = this._duration;
      this._startTime = Date.now();
      this._pausedRemaining = null;
    } else if (this._state === State.PAUSED) {
      this._startTime = Date.now() - (this._pausedRemaining * 1000);
      this._pausedRemaining = null;
    } else {
      return;
    }

    this._state = State.RUNNING;
    this._saveState();
    this._notifyStateChange();
    this._startTicking();
  }

  /**
   * 暂停计时
   */
  pause() {
    if (this._state !== State.RUNNING) {
      return;
    }

    this._stopTicking();
    this._pausedRemaining = this._remaining;
    this._state = State.PAUSED;
    this._saveState();
    this._notifyStateChange();
  }

  /**
   * 跳过当前阶段
   */
  skip() {
    this._stopTicking();
    this._state = State.COMPLETED;
    this._saveState();
    this._notifyStateChange();

    if (this._options.onPhaseComplete) {
      this._options.onPhaseComplete(this._phase);
    }

    this._nextPhase();
  }

  /**
   * 重置计时器到初始状态
   */
  reset() {
    this._stopTicking();
    this._state = State.IDLE;
    this._phase = Phase.WORK;
    this._completedPomodoros = 0;
    this._updateDuration();
    this._remaining = this._duration;
    this._startTime = null;
    this._pausedRemaining = null;
    this._saveState();
    this._notifyStateChange();
  }

  /**
   * 更新设置（立即生效）
   * @param {Object} settings - 新的时间设置
   */
  updateSettings(settings) {
    this._updateDuration();

    if (this._state === State.IDLE) {
      this._remaining = this._duration;
    } else if (this._state === State.PAUSED && this._pausedRemaining !== null) {
      // 暂停状态时，如果新设置的时长小于已用时间，重置剩余时间
      if (this._pausedRemaining > this._duration) {
        this._pausedRemaining = this._duration;
        this._remaining = this._duration;
      }
    }

    this._saveState();
  }

  /**
   * 从持久化状态恢复
   * @param {Object} state - 之前保存的状态
   */
  restore() {
    const saved = Storage.get('timer_state');
    if (!saved) {
      this._remaining = this._duration;
      return;
    }

    this._phase = saved.phase || Phase.WORK;
    this._completedPomodoros = saved.completedPomodoros || 0;
    this._updateDuration();

    switch (saved.state) {
      case State.RUNNING:
        // 计算已过时间
        const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
        const remaining = this._duration - elapsed;

        if (remaining > 0) {
          this._remaining = remaining;
          this._startTime = saved.startTime;
          this._state = State.RUNNING;
          this._notifyStateChange();
          this._startTicking();
        } else {
          // 时间已到，完成阶段
          this._remaining = 0;
          this._state = State.COMPLETED;
          if (this._options.onPhaseComplete) {
            this._options.onPhaseComplete(this._phase);
          }
          this._nextPhase();
        }
        break;

      case State.PAUSED:
        this._remaining = saved.pausedRemaining || this._duration;
        this._pausedRemaining = this._remaining;
        this._state = State.PAUSED;
        this._notifyStateChange();
        break;

      default:
        this._remaining = this._duration;
        this._state = State.IDLE;
        break;
    }
  }

  /**
   * 开始 tick 循环
   */
  _startTicking() {
    this._stopTicking();

    // 立即触发一次
    this._tick();

    this._intervalId = setInterval(() => {
      this._tick();
    }, 1000);
  }

  /**
   * 停止 tick 循环
   */
  _stopTicking() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * tick 逻辑 - 基于绝对时间戳计算
   */
  _tick() {
    if (this._state !== State.RUNNING) {
      return;
    }

    const elapsed = Math.floor((Date.now() - this._startTime) / 1000);
    this._remaining = Math.max(0, this._duration - elapsed);

    if (this._options.onTick) {
      this._options.onTick(this._remaining, this._phase);
    }

    this._saveState();

    if (this._remaining <= 0) {
      this._completePhase();
    }
  }

  /**
   * 完成当前阶段
   */
  _completePhase() {
    this._stopTicking();
    this._state = State.COMPLETED;
    this._saveState();
    this._notifyStateChange();

    if (this._options.onPhaseComplete) {
      this._options.onPhaseComplete(this._phase);
    }

    this._nextPhase();
  }

  /**
   * 进入下一阶段
   */
  _nextPhase() {
    const settings = this._settings.getAll();

    if (this._phase === Phase.WORK) {
      this._completedPomodoros++;

      if (this._completedPomodoros >= settings.pomodorosUntilLongBreak) {
        this._phase = Phase.LONG_BREAK;
        this._completedPomodoros = 0;
      } else {
        this._phase = Phase.SHORT_BREAK;
      }
    } else {
      this._phase = Phase.WORK;
    }

    this._updateDuration();
    this._remaining = this._duration;
    this._state = State.IDLE;
    this._startTime = null;
    this._pausedRemaining = null;
    this._saveState();
    this._notifyStateChange();
  }

  /**
   * 通知状态变化
   */
  _notifyStateChange() {
    if (this._options.onStateChange) {
      this._options.onStateChange(this.getState());
    }
  }

  /**
   * 保存状态到 Storage
   */
  _saveState() {
    Storage.set('timer_state', {
      state: this._state,
      phase: this._phase,
      startTime: this._startTime,
      pausedRemaining: this._pausedRemaining,
      completedPomodoros: this._completedPomodoros,
      lastUpdate: Date.now()
    });
  }
}
