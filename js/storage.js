/**
 * Storage 模块 - localStorage 封装层
 * 所有键名使用 tc_ 前缀
 */
const Storage = {
  PREFIX: 'tc_',

  /**
   * 检查 localStorage 是否可用
   */
  _checkAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 获取指定 key 的数据
   * @param {string} key - 存储键名（不含前缀）
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(key, defaultValue = null) {
    if (!this._checkAvailable()) {
      throw new Error('localStorage 不可用，请检查浏览器设置');
    }

    try {
      const value = localStorage.getItem(this.PREFIX + key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * 存储数据
   * @param {string} key - 存储键名（不含前缀）
   * @param {*} value - 要存储的值
   */
  set(key, value) {
    if (!this._checkAvailable()) {
      throw new Error('localStorage 不可用，请检查浏览器设置');
    }

    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      throw new Error('存储失败: ' + e.message);
    }
  },

  /**
   * 删除指定 key
   * @param {string} key - 存储键名（不含前缀）
   */
  remove(key) {
    if (!this._checkAvailable()) {
      throw new Error('localStorage 不可用，请检查浏览器设置');
    }

    localStorage.removeItem(this.PREFIX + key);
  },

  /**
   * 清除所有应用数据（仅清除 tc_ 前缀的键）
   */
  clear() {
    if (!this._checkAvailable()) {
      throw new Error('localStorage 不可用，请检查浏览器设置');
    }

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};
