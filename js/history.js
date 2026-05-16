/**
 * History 模块 - 历史记录管理、聚合统计
 */
class History {
  constructor() {
    this._records = [];
    this.load();
  }

  /**
   * 生成唯一 ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 获取今天的日期字符串
   */
  _getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 添加一条历史记录
   * @param {Object} record - 记录数据（不含 id 和 pomodoroCount）
   */
  add(record) {
    const today = this._getToday();

    // 计算当天累计 pomodoroCount
    const todayRecords = this._records.filter(r => r.date === today);
    const maxCount = todayRecords.reduce((max, r) => Math.max(max, r.pomodoroCount), 0);

    const newRecord = {
      id: this._generateId(),
      date: today,
      completedAt: Date.now(),
      focusDuration: record.focusDuration,
      breakDuration: record.breakDuration,
      pomodoroCount: maxCount + 1
    };

    this._records.push(newRecord);
    this.save();

    return newRecord;
  }

  /**
   * 获取所有记录（按时间倒序）
   * @returns {Array}
   */
  getAll() {
    return [...this._records].sort((a, b) => b.completedAt - a.completedAt);
  }

  /**
   * 按日期分组获取记录
   * @returns {Object} { '2024-05-16': [...records] }
   */
  getGroupedByDate() {
    const grouped = {};

    for (const record of this._records) {
      if (!grouped[record.date]) {
        grouped[record.date] = [];
      }
      grouped[record.date].push(record);
    }

    // 每组内按时间倒序
    for (const date in grouped) {
      grouped[date].sort((a, b) => b.completedAt - a.completedAt);
    }

    // 按日期倒序
    const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const result = {};
    for (const key of sortedKeys) {
      result[key] = grouped[key];
    }

    return result;
  }

  /**
   * 获取每日番茄钟数量（用于折线图）
   * @param {number} days - 最近 N 天，默认 30
   * @returns {Array<{date: string, count: number}>}
   */
  getDailyCounts(days = 30) {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this._formatDate(date);

      const count = this._records.filter(r => r.date === dateStr).length;
      result.push({ date: dateStr, count });
    }

    return result;
  }

  /**
   * 获取每周汇总
   * @param {number} weeks - 最近 N 周，默认 12
   * @returns {Array<{weekStart: string, weekEnd: string, count: number}>}
   */
  getWeeklyCounts(weeks = 12) {
    const result = [];
    const today = new Date();

    // 找到本周一
    const currentMonday = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentMonday.setDate(today.getDate() + diff);

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(currentMonday.getDate() - (i * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = this._formatDate(weekStart);
      const endStr = this._formatDate(weekEnd);

      const count = this._records.filter(r => {
        return r.date >= startStr && r.date <= endStr;
      }).length;

      result.push({ weekStart: startStr, weekEnd: endStr, count });
    }

    return result;
  }

  /**
   * 获取每月汇总
   * @param {number} months - 最近 N 月，默认 6
   * @returns {Array<{month: string, count: number}>}
   */
  getMonthlyCounts(months = 6) {
    const result = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;

      const count = this._records.filter(r => r.date.startsWith(monthStr)).length;
      result.push({ month: monthStr, count });
    }

    return result;
  }

  /**
   * 清除所有历史记录
   */
  clearAll() {
    this._records = [];
    this.save();
  }

  /**
   * 从持久化存储恢复
   */
  load() {
    this._records = Storage.get('history', []);
  }

  /**
   * 保存到持久化存储
   */
  save() {
    Storage.set('history', this._records);
  }

  /**
   * 格式化日期
   */
  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
