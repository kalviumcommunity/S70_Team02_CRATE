/* ==========================================================================
   CRATE Analytics - Interactive Application Logic & Custom SVG Chart Engine
   ========================================================================== */

// --- Application State ---
const state = {
  currentRepo: 'CRATE-Core-Repo',
  currentTime: '30d',
  activeMetric: 'active', // 'active' | 'merge' | 'review' | 'churn'
  theme: 'light'
};

// Metric Configurations & Data Generator Generators
const METRIC_CONFIG = {
  active: {
    title: 'Active Contributors',
    unit: '',
    format: (val) => val.toLocaleString(),
    yMax: 1500,
    baseVal: 1248,
    badgeText: '+14.2%',
    badgeType: 'positive',
    curveType: 'growth'
  },
  merge: {
    title: 'PR Merge Rate',
    unit: '%',
    format: (val) => `${val}%`,
    yMax: 100,
    baseVal: 68,
    badgeText: '+5.1%',
    badgeType: 'positive',
    curveType: 'steady'
  },
  review: {
    title: 'Avg. Time to First Review',
    unit: 'h',
    format: (val) => `${val}h`,
    yMax: 48,
    baseVal: 14,
    badgeText: '-3.2h',
    badgeType: 'positive',
    curveType: 'decay'
  },
  churn: {
    title: 'Churned (30d)',
    unit: '',
    format: (val) => val,
    yMax: 100,
    baseVal: 42,
    badgeText: '-8.0%',
    badgeType: 'negative',
    curveType: 'flat'
  }
};

// Date label generator for time range
function getDateLabels(timeRange) {
  if (timeRange === '7d') {
    return ['Dec 27', 'Dec 28', 'Dec 29', 'Dec 30', 'Dec 31', 'Jan 1', 'Jan 2'];
  } else if (timeRange === '90d') {
    return ['Oct 1', 'Oct 15', 'Nov 1', 'Nov 15', 'Dec 1', 'Dec 15', 'Jan 1'];
  } else if (timeRange === '1y') {
    return ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Jan'];
  }
  // Default 30d matching reference image
  return ['Dec 24', 'Dec 25', 'Dec 26', 'Dec 27', 'Dec 28', 'Dec 29', 'Dec 3'];
}

// Generate realistic dataset points based on state
function generateDataSet(repo, timeRange, metric) {
  const dates = getDateLabels(timeRange);
  const cfg = METRIC_CONFIG[metric];
  
  // Repo scale multiplier
  let repoMultiplier = 1.0;
  if (repo === 'crate-cli') repoMultiplier = 0.45;
  if (repo === 'crate-docs') repoMultiplier = 0.25;
  if (repo === 'all-repos') repoMultiplier = 1.6;

  // Base values adjusted for repo
  const currentPoints = [];
  const precedingPoints = [];

  const count = dates.length;
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    let curVal = cfg.baseVal * repoMultiplier;
    let prevVal = curVal * 0.88;

    if (metric === 'active') {
      curVal += Math.sin(progress * Math.PI) * 120 * repoMultiplier + (progress * 150 * repoMultiplier);
      prevVal += Math.sin(progress * Math.PI) * 90 * repoMultiplier + (progress * 80 * repoMultiplier);
    } else if (metric === 'merge') {
      curVal = Math.min(95, Math.max(40, curVal + (Math.sin(progress * 4) * 8)));
      prevVal = Math.min(95, Math.max(40, prevVal + (Math.cos(progress * 4) * 6)));
    } else if (metric === 'review') {
      curVal = Math.max(4, curVal - (progress * 6));
      prevVal = Math.max(6, prevVal - (progress * 4));
    } else if (metric === 'churn') {
      curVal = Math.max(10, curVal + (Math.sin(progress * 6) * 12));
      prevVal = Math.max(10, prevVal + (Math.cos(progress * 6) * 10));
    }

    currentPoints.push(Math.round(curVal * 10) / 10);
    precedingPoints.push(Math.round(prevVal * 10) / 10);
  }

  return { dates, currentPoints, precedingPoints, cfg };
}

// --- Smooth Bezier Curve Path Generator ---
function createSmoothPath(points, width, height, yMax, padding = { top: 40, bottom: 50, left: 50, right: 20 }) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const coords = points.map((val, idx) => {
    const x = padding.left + (idx / (points.length - 1)) * chartW;
    const normalizedY = Math.min(1, Math.max(0, val / yMax));
    const y = padding.top + (1 - normalizedY) * chartH;
    return { x, y };
  });

  // Calculate smooth Bezier path string
  let lineD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) * 0.15;
    const cp1y = p1.y + (p2.y - p0.y) * 0.15;
    const cp2x = p2.x - (p3.x - p1.x) * 0.15;
    const cp2y = p2.y - (p3.y - p1.y) * 0.15;

    lineD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  // Area path closing
  const lastX = coords[coords.length - 1].x;
  const firstX = coords[0].x;
  const baselineY = height - padding.bottom;

  const areaD = `${lineD} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

  return { lineD, areaD, coords };
}

// --- Render Chart UI ---
let currentChartData = null;

function renderChart() {
  const { dates, currentPoints, precedingPoints, cfg } = generateDataSet(state.currentRepo, state.currentTime, state.activeMetric);
  currentChartData = { dates, currentPoints, precedingPoints, cfg };

  // Calculate dynamic max for Y scale
  const maxVal = Math.max(...currentPoints, ...precedingPoints);
  const yMax = Math.ceil((maxVal * 1.25) / 100) * 100 || 100;

  // Update Y Axis Labels
  document.getElementById('y-label-1000').textContent = cfg.format(Math.round(yMax));
  document.getElementById('y-label-500').textContent = cfg.format(Math.round(yMax / 2));

  // Render SVG Paths
  const width = 900;
  const height = 320;
  const curPath = createSmoothPath(currentPoints, width, height, yMax);
  const prevPath = createSmoothPath(precedingPoints, width, height, yMax);

  document.getElementById('current-line-path').setAttribute('d', curPath.lineD);
  document.getElementById('current-area-path').setAttribute('d', curPath.areaD);

  document.getElementById('preceding-line-path').setAttribute('d', prevPath.lineD);
  document.getElementById('preceding-area-path').setAttribute('d', prevPath.areaD);

  currentChartData.curCoords = curPath.coords;
  currentChartData.prevCoords = prevPath.coords;

  // Render X Axis Labels
  const xAxisContainer = document.getElementById('x-axis-labels');
  xAxisContainer.innerHTML = '';

  const chartW = width - 70;
  dates.forEach((dateStr, idx) => {
    const x = 50 + (idx / (dates.length - 1)) * chartW;
    const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textNode.setAttribute('x', x);
    textNode.setAttribute('y', 295);
    textNode.setAttribute('text-anchor', 'middle');
    textNode.textContent = dateStr;
    xAxisContainer.appendChild(textNode);
  });

  // Update metric tab value displays dynamically
  updateMetricTabDisplays();
}

function updateMetricTabDisplays() {
  const repo = state.currentRepo;
  const mult = repo === 'crate-cli' ? 0.45 : repo === 'crate-docs' ? 0.25 : repo === 'all-repos' ? 1.6 : 1;

  document.getElementById('val-active').textContent = Math.round(1248 * mult).toLocaleString();
  document.getElementById('val-merge').textContent = `${Math.min(98, Math.round(68 * (1 + (mult - 1) * 0.1)))}%`;
  document.getElementById('val-review').textContent = `${Math.round(14 * (1 / (0.8 + mult * 0.2)))}h`;
  document.getElementById('val-churn').textContent = Math.round(42 * mult);
}

// --- Interactive Chart Tooltip Handling ---
function setupChartInteractivity() {
  const svg = document.getElementById('analytics-svg');
  const interactiveGroup = document.getElementById('interactive-group');
  const crosshair = document.getElementById('crosshair-v');
  const ptCurrent = document.getElementById('point-current');
  const ptPreceding = document.getElementById('point-preceding');
  const tooltip = document.getElementById('chart-tooltip');

  const ttDate = document.getElementById('tooltip-date');
  const ttCurVal = document.getElementById('tooltip-current-val');
  const ttPrevVal = document.getElementById('tooltip-prev-val');

  svg.addEventListener('mousemove', (e) => {
    if (!currentChartData || !currentChartData.curCoords) return;

    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * 900;

    // Find nearest point index
    const coords = currentChartData.curCoords;
    let closestIdx = 0;
    let minDiff = Infinity;

    coords.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    const targetCur = currentChartData.curCoords[closestIdx];
    const targetPrev = currentChartData.prevCoords[closestIdx];
    const dateStr = currentChartData.dates[closestIdx];
    const curVal = currentChartData.currentPoints[closestIdx];
    const prevVal = currentChartData.precedingPoints[closestIdx];
    const cfg = currentChartData.cfg;

    // Update crosshair & dots
    interactiveGroup.style.display = 'block';
    crosshair.setAttribute('x1', targetCur.x);
    crosshair.setAttribute('x2', targetCur.x);

    ptCurrent.setAttribute('cx', targetCur.x);
    ptCurrent.setAttribute('cy', targetCur.y);

    ptPreceding.setAttribute('cx', targetPrev.x);
    ptPreceding.setAttribute('cy', targetPrev.y);

    // Update floating tooltip position and content
    ttDate.textContent = dateStr;
    ttCurVal.textContent = cfg.format(curVal);
    ttPrevVal.textContent = cfg.format(prevVal);

    const tooltipX = (targetCur.x / 900) * rect.width;
    const tooltipY = (targetCur.y / 320) * rect.height;

    tooltip.style.left = `${tooltipX + 24}px`;
    tooltip.style.top = `${tooltipY + 16}px`;
    tooltip.classList.add('visible');
  });

  svg.addEventListener('mouseleave', () => {
    interactiveGroup.style.display = 'none';
    tooltip.classList.remove('visible');
  });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Metric Tab Switching
  const metricTabs = document.querySelectorAll('.metric-tab');
  metricTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      metricTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeMetric = tab.getAttribute('data-metric');
      renderChart();
    });
  });

  // Dropdown Toggles
  setupDropdown('repo-dropdown', 'selected-repo', (val) => {
    state.currentRepo = val;
    renderChart();
    showToast(`Updated repository focus: ${val}`);
  });

  setupDropdown('time-dropdown', 'selected-time', (val) => {
    state.currentTime = val;
    renderChart();
    showToast(`Time range filter applied: ${val}`);
  });

  // Theme Toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme');
      state.theme = 'light';
    } else {
      document.body.classList.add('dark-theme');
      state.theme = 'dark';
    }
  });

  // Modal Controllers
  document.querySelectorAll('.connect-github-trigger').forEach((btn) => {
    btn.addEventListener('click', () => openModal('github-modal'));
  });

  document.getElementById('view-demo-btn').addEventListener('click', () => {
    document.querySelector('.dashboard-preview-section').scrollIntoView({ behavior: 'smooth' });
    showToast('Interactive Demo Dashboard ready to explore!');
  });

  document.getElementById('open-retention-btn').addEventListener('click', () => openModal('retention-drawer'));
  document.getElementById('card-ai-insights').addEventListener('click', () => openModal('ai-modal'));
  document.getElementById('open-pricing-btn').addEventListener('click', () => openModal('pricing-modal'));

  document.getElementById('open-docs-btn').addEventListener('click', () => {
    showToast('CRATE Integration Docs loaded in tab!');
  });

  document.getElementById('login-btn').addEventListener('click', () => {
    openModal('github-modal');
  });

  document.getElementById('confirm-connect-btn').addEventListener('click', () => {
    closeModal('github-modal');
    showToast('GitHub organization connected & synced successfully!');
  });

  // Close modals on backdrop / button click
  document.querySelectorAll('[data-close]').forEach((element) => {
    element.addEventListener('click', () => {
      const modalId = element.getAttribute('data-close');
      closeModal(modalId);
    });
  });
}

function setupDropdown(containerId, labelId, onSelect) {
  const container = document.getElementById(containerId);
  const trigger = container.querySelector('.dropdown-trigger');
  const menu = container.querySelector('.dropdown-menu');
  const items = container.querySelectorAll('.dropdown-item');
  const label = document.getElementById(labelId);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach((m) => {
      if (m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
  });

  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      items.forEach((i) => i.classList.remove('selected'));
      item.classList.add('selected');
      label.textContent = item.textContent;
      menu.classList.remove('show');
      if (onSelect) onSelect(item.getAttribute('data-value'));
    });
  });

  document.addEventListener('click', () => {
    menu.classList.remove('show');
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
}

// Toast Helper
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  msgEl.textContent = message;

  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderChart();
  setupChartInteractivity();
  setupEventListeners();
});
