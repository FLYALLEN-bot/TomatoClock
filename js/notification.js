/**
 * Notification 模块 - 声音播放和浏览器通知
 */
const NotificationModule = {
  _permissionGranted: false,
  _audioContext: null,

  /**
   * 初始化模块，请求通知权限
   * @returns {Promise<boolean>} 是否获得权限
   */
  async init() {
    if (!('Notification' in window)) {
      console.warn('浏览器不支持通知功能');
      return false;
    }

    if (Notification.permission === 'granted') {
      this._permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this._permissionGranted = permission === 'granted';
      return this._permissionGranted;
    }

    return false;
  },

  /**
   * 播放提示音 - 使用 Web Audio API 合成"叮咚"音效
   */
  playSound() {
    try {
      if (!this._audioContext) {
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = this._audioContext;

      // 第一个音：880Hz，200ms
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 880;
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      // 第二个音：660Hz，200ms，延迟 0.15 秒
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 660;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('播放声音失败:', e);
    }
  },

  /**
   * 显示浏览器通知
   * @param {string} title - 通知标题
   * @param {string} body - 通知内容
   */
  show(title, body) {
    if (!this._permissionGranted) {
      return;
    }

    try {
      new Notification(title, {
        body: body,
        icon: 'assets/images/icon-192.png',
        tag: 'tomato-clock'
      });
    } catch (e) {
      console.warn('显示通知失败:', e);
    }
  },

  /**
   * 触发完整的提醒（声音 + 通知）
   * @param {string} phase - 完成的阶段类型 ('work', 'short', 'long')
   */
  alert(phase) {
    this.playSound();

    let title, body;
    if (phase === 'work') {
      title = '番茄钟';
      body = '休息时间到！';
    } else {
      title = '番茄钟';
      body = '开始新的番茄钟';
    }

    this.show(title, body);
  }
};
