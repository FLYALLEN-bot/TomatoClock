/**
 * Settings 模块 - 时间配置管理、持久化
 */
class Settings {
  constructor() {
    this._defaults = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      pomodorosUntilLongBreak: 4
    };

    this._ranges = {
      workDuration: { min: 1, max: 60 },
      shortBreakDuration: { min: 1, max: 30 },
      longBreakDuration: { min: 1, max: 60 },
      pomodorosUntilLongBreak: { min: 1, max: 10 }
    };

    this._settings = { ...this._defaults };
    this.onChange = null;
    this.load();
  }

  /**
   * 获取当前设置
   * @returns {Object}
   */
  getAll() {
    return { ...this._settings };
  }

  /**
   * 更新设置（合并更新，含参数校验）
   * @param {Object} partial - 部分设置
   * @throws {Error} 参数越界时抛出错误
   */
  update(partial) {
    for (const [key, value] of Object.entries(partial)) {
      if (!(key in this._defaults)) {
        continue;
      }

      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new Error(`${key} 必须是整数`);
      }

      const range = this._ranges[key];
      if (value < range.min || value > range.max) {
        throw new Error(`${key} 必须在 ${range.min}-${range.max} 之间`);
      }
    }

    Object.assign(this._settings, partial);
    this.save();

    if (this.onChange) {
      this.onChange(this.getAll());
    }
  }

  /**
   * 重置为默认值
   */
  reset() {
    this._settings = { ...this._defaults };
    this.save();

    if (this.onChange) {
      this.onChange(this.getAll());
    }
  }

  /**
   * 从持久化存储恢复
   */
  load() {
    const saved = Storage.get('settings');
    if (saved) {
      this._settings = { ...this._defaults, ...saved };
    }
  }

  /**
   * 保存到持久化存储
   */
  save() {
    Storage.set('settings', this._settings);
  }
}
