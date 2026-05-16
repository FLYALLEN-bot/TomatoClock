/**
 * Chart 模块 - 使用 Chart.js 渲染统计图表
 */
class TomatoChart {
  /**
   * @param {string} canvasId - canvas 元素 ID
   */
  constructor(canvasId) {
    this._canvas = document.getElementById(canvasId);
    this._ctx = this._canvas.getContext('2d');
    this._chart = null;
  }

  /**
   * 销毁现有图表
   */
  _destroyExisting() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  }

  /**
   * 渲染每日番茄钟折线图
   * @param {Array<{date: string, count: number}>} data
   */
  renderDaily(data) {
    this._destroyExisting();

    const labels = data.map(d => {
      const parts = d.date.split('-');
      return `${parts[1]}-${parts[2]}`;
    });

    const counts = data.map(d => d.count);

    this._chart = new Chart(this._ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '番茄钟数',
          data: counts,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#FF6B6B',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#FF6B6B',
            titleFont: { size: 14, family: "'Nunito', sans-serif" },
            bodyFont: { size: 13, family: "'Nunito', sans-serif" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.parsed.y} 个番茄钟`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11, family: "'Nunito', sans-serif" },
              color: '#999'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 12, family: "'Nunito', sans-serif" },
              color: '#999'
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          }
        }
      }
    });
  }

  /**
   * 渲染每周汇总柱状图
   * @param {Array<{weekStart: string, weekEnd: string, count: number}>} data
   */
  renderWeekly(data) {
    this._destroyExisting();

    const labels = data.map(d => {
      const parts = d.weekStart.split('-');
      return `${parts[1]}-${parts[2]}`;
    });

    const counts = data.map(d => d.count);

    this._chart = new Chart(this._ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '番茄钟数',
          data: counts,
          backgroundColor: 'rgba(255, 107, 107, 0.6)',
          borderColor: '#FF6B6B',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#FF6B6B',
            titleFont: { size: 14, family: "'Nunito', sans-serif" },
            bodyFont: { size: 13, family: "'Nunito', sans-serif" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                return `${data[idx].weekStart} ~ ${data[idx].weekEnd}`;
              },
              label: (context) => `${context.parsed.y} 个番茄钟`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11, family: "'Nunito', sans-serif" },
              color: '#999'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 12, family: "'Nunito', sans-serif" },
              color: '#999'
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          }
        }
      }
    });
  }

  /**
   * 渲染每月汇总柱状图
   * @param {Array<{month: string, count: number}>} data
   */
  renderMonthly(data) {
    this._destroyExisting();

    const labels = data.map(d => d.month);
    const counts = data.map(d => d.count);

    this._chart = new Chart(this._ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '番茄钟数',
          data: counts,
          backgroundColor: 'rgba(255, 159, 67, 0.6)',
          borderColor: '#FF9F43',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#FF9F43',
            titleFont: { size: 14, family: "'Nunito', sans-serif" },
            bodyFont: { size: 13, family: "'Nunito', sans-serif" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.parsed.y} 个番茄钟`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11, family: "'Nunito', sans-serif" },
              color: '#999'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 12, family: "'Nunito', sans-serif" },
              color: '#999'
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          }
        }
      }
    });
  }

  /**
   * 销毁图表实例，释放资源
   */
  destroy() {
    this._destroyExisting();
  }
}
