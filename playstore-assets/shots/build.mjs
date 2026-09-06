import fs from 'fs';
const I = JSON.parse(fs.readFileSync('icons.json', 'utf8'));

const ic = (name, size = 24, cls = '') =>
  `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[name] || ''}</svg>`;

const header = (title, initial = 'P') => `
<header class="header"><div class="header-top">
  <h1 class="header-title">${title}</h1>
  <div class="header-user"><div class="user-avatar">${initial}</div></div>
</div></header>`;

const nav = (active) => {
  const items = [['home', 'Home', 'home'], ['calendar', 'Calendar', 'calendar'],
    ['messages', 'Messages', 'message-square'], ['notifications', 'Announcements', 'bell'],
    ['profile', 'Profile', 'user']];
  return `<nav class="bottom-nav">${items.map(([k, label, icon]) =>
    `<button class="nav-item ${k === active ? 'active' : ''}">${ic(icon, 24, 'nav-item-icon')}<span class="nav-item-label">${label}</span></button>`).join('')}</nav>`;
};

const qa = (icon, cls, label) =>
  `<button class="quick-action"><div class="quick-action-icon ${cls}">${ic(icon)}</div><span class="quick-action-label">${label}</span></button>`;

/* ---------- Screens ---------- */

const parentHome = header('Parent Dashboard', 'R') + `
<div class="content">
  <div class="child-card">
    <div class="child-avatar">👧</div>
    <div class="child-info"><h3>Aanya Rao</h3><p>LKG • 4-5 years</p></div>
    <div class="child-status present">Present</div>
  </div>
  <div class="quick-actions">
    ${qa('check-circle', 'attendance', 'Attendance')}
    ${qa('message-square', 'messages', 'Messages')}
    ${qa('credit-card', 'fees', 'Fees')}
    ${qa('bell', 'announcements', 'Announcements')}
    ${qa('calendar', 'calendar', 'Calendar')}
    ${qa('file-text', 'reports', 'Reports')}
    ${qa('camera', 'gallery', 'Gallery')}
    ${qa('qr-code', 'qr', 'Check In')}
  </div>
  <div class="card">
    <div class="card-header"><h3 class="card-title">Today's Activity</h3><span class="card-subtitle">Updated 10 min ago</span></div>
    <div class="activity-feed">
      <div class="activity-item"><div class="activity-icon meal">🍽️</div>
        <div class="activity-content"><div class="activity-title">Snack</div>
        <div class="activity-description">Fruit bowl &amp; milk - ate most</div></div>
        <div class="activity-time">10:15 AM</div></div>
      <div class="activity-item"><div class="activity-icon nap">😴</div>
        <div class="activity-content"><div class="activity-title">Nap Time</div>
        <div class="activity-description">Slept well - restful</div></div>
        <div class="activity-time">1:00 - 2:15 PM</div></div>
      <div class="activity-item"><div class="activity-icon activity">🎨</div>
        <div class="activity-content"><div class="activity-title">Art &amp; Craft</div>
        <div class="activity-description">Made paper butterflies</div></div>
        <div class="activity-time">11:00 AM</div></div>
      <div class="activity-item"><div class="activity-icon activity">📖</div>
        <div class="activity-content"><div class="activity-title">Story Time</div>
        <div class="activity-description">The Thirsty Crow</div></div>
        <div class="activity-time">2:30 PM</div></div>
      <div class="activity-item"><div class="activity-icon meal">🍎</div>
        <div class="activity-content"><div class="activity-title">Lunch</div>
        <div class="activity-description">Rice, dal &amp; curd - finished</div></div>
        <div class="activity-time">12:30 PM</div></div>
    </div>
  </div>
</div>` + nav('home');

const attendance = header('', 'M') + `
<div class="content">
  <div class="page-header"><h2 class="page-title">Attendance</h2></div>
  <div class="attendance-date">
    <button>${ic('chevron-left', 20)}</button><span>Today</span>
    <button style="opacity:.3">${ic('chevron-right', 20)}</button>
  </div>
  <div class="attendance-list">
    <div style="padding:10px 16px;background:#f5f5f5;color:#555;font-weight:600;font-size:13px;letter-spacing:.5px;text-transform:uppercase;border-radius:8px">LKG</div>
    ${[['👦', 'Aarav Menon', 'present'], ['👧', 'Aanya Rao', 'present'],
       ['👦', 'Vihaan Shetty', 'late'], ['👧', 'Ira Bhat', 'present'],
       ['👦', 'Kabir Naik', 'absent']]
      .map(([e, n, st]) => `
    <div class="attendance-item">
      <div class="attendance-avatar">${e}</div>
      <div class="attendance-info"><div class="attendance-name">${n}</div><div class="attendance-class">LKG</div></div>
      <div class="attendance-status">
        <button class="status-btn present ${st === 'present' ? 'active' : ''}">${ic('check-circle', 18)}</button>
        <button class="status-btn absent ${st === 'absent' ? 'active' : ''}">${ic('x', 18)}</button>
        <button class="status-btn late ${st === 'late' ? 'active' : ''}">${ic('clock', 18)}</button>
      </div>
    </div>`).join('')}
  </div>
</div>` + nav('home');

const fees = header('', 'R') + `
<div style="padding-bottom:80px">
  <div class="page-header" style="padding:16px 16px 0"><h2 class="page-title">Fee Payments</h2></div>
  <div class="fee-summary-card">
    <div class="fee-summary-header">
      <div><h3>Total Pending</h3><p class="fee-summary-amount">₹12,500</p></div>
      <div class="fee-summary-icon">💳</div>
    </div>
  </div>
  <div class="fee-list-container">
    <div class="fee-card">
      <div class="fee-card-header">
        <div class="fee-card-info"><h4>Term 2 Tuition</h4><p class="fee-card-date">Due 15 Sep 2026</p></div>
        <span class="fee-badge pending">pending</span>
      </div>
      <div class="fee-card-body">
        <span class="fee-card-amount">₹8,500</span>
        <button class="btn-pay-now">${ic('credit-card', 16)} Pay Now</button>
      </div>
    </div>
    <div class="fee-card">
      <div class="fee-card-header">
        <div class="fee-card-info"><h4>Transport - Sep</h4><p class="fee-card-date">Due 05 Sep 2026</p></div>
        <span class="fee-badge overdue">overdue</span>
      </div>
      <div class="fee-card-body">
        <span class="fee-card-amount">₹4,000</span>
        <button class="btn-pay-now">${ic('credit-card', 16)} Pay Now</button>
      </div>
    </div>
    <div class="fee-card">
      <div class="fee-card-header">
        <div class="fee-card-info"><h4>Term 1 Tuition</h4><p class="fee-card-date">Paid 12 Jun 2026</p></div>
        <span class="fee-badge paid">paid</span>
      </div>
      <div class="fee-card-body"><span class="fee-card-amount">₹8,500</span></div>
    </div>
    <div class="fee-card">
      <div class="fee-card-header">
        <div class="fee-card-info"><h4>Annual Activity Fee</h4><p class="fee-card-date">Paid 02 Apr 2026</p></div>
        <span class="fee-badge paid">paid</span>
      </div>
      <div class="fee-card-body"><span class="fee-card-amount">₹3,000</span></div>
    </div>
  </div>
</div>` + nav('home');

const admin = header('Admin Dashboard', 'V') + `
<div class="content">
  <div class="stats-grid">
    <div class="stat-card primary"><div class="stat-value">148</div><div class="stat-label">Total Students</div></div>
    <div class="stat-card success"><div class="stat-value">133</div><div class="stat-label">Present Today</div></div>
    <div class="stat-card warning"><div class="stat-value">9</div><div class="stat-label">Pending Fees</div></div>
    <div class="stat-card danger"><div class="stat-value">12</div><div class="stat-label">Staff Members</div></div>
  </div>
  <div class="quick-actions">
    ${qa('trending-up', 'analytics', 'Fee Analytics')}
    ${qa('indian-rupee', 'fees', 'Manage Fees')}
    ${qa('user-plus', 'create-user', 'Add Student')}
    ${qa('users', 'students', 'Manage Users')}
    ${qa('check-circle', 'attendance', 'Attendance')}
    ${qa('user-check', 'staff', 'Staff')}
    ${qa('bell', 'announcements', 'Announce')}
    ${qa('camera', 'gallery', 'Gallery')}
  </div>
  <div class="card">
    <div class="card-header"><h3 class="card-title">Recent Announcements</h3></div>
    <div class="activity-feed">
      <div class="activity-item"><div class="activity-icon activity">📢</div>
        <div class="activity-content"><div class="activity-title">Annual Day rehearsal</div>
        <div class="activity-description">Pick-up moves to 4:30 PM this week</div></div></div>
      <div class="activity-item"><div class="activity-icon meal">🎉</div>
        <div class="activity-content"><div class="activity-title">Onam celebration</div>
        <div class="activity-description">Children may wear traditional dress</div></div></div>
    </div>
  </div>
</div>` + nav('home');

const analytics = header('', 'V') + `
<div class="content analytics-overview">
  <div class="page-header"><h2 class="page-title">Attendance Analytics</h2></div>
  <div class="stats-grid">
    <div class="stat-card primary">
      <div class="stat-icon">${ic('trending-up', 24)}</div>
      <div class="stat-content"><div class="stat-value">92.4%</div><div class="stat-label">Average attendance this month</div></div>
    </div>
    <div class="stat-card success"><div class="stat-icon">${ic('check-circle', 24)}</div>
      <div class="stat-content"><div class="stat-value">133</div><div class="stat-label">Present</div></div></div>
    <div class="stat-card danger"><div class="stat-icon">${ic('x', 24)}</div>
      <div class="stat-content"><div class="stat-value">8</div><div class="stat-label">Absent</div></div></div>
  </div>
  <div class="trend-section">
    <h3 style="font-size:16px;font-weight:600;margin-bottom:12px">Last 7 days</h3>
    <div class="trend-chart">
      ${[['Mon', 94], ['Tue', 88], ['Wed', 96], ['Thu', 91], ['Fri', 85], ['Sat', 93], ['Mon', 97]]
        .map(([d, v]) => `<div class="trend-bar-container">
          <span class="trend-value">${v}%</span>
          <div class="trend-bar-wrapper"><div class="trend-bar" style="height:${v}%;background:linear-gradient(180deg,#4DB6AC,#00897B)"></div></div>
          <span class="trend-label">${d}</span>
        </div>`).join('')}
    </div>
  </div>
  <div class="breakdown-section">
    <h3>Breakdown</h3>
    <div class="breakdown-bar">
      <div class="breakdown-segment present" style="width:86%"></div>
      <div class="breakdown-segment late" style="width:6%"></div>
      <div class="breakdown-segment half-day" style="width:3%"></div>
      <div class="breakdown-segment absent" style="width:5%"></div>
    </div>
    <div class="breakdown-legend">
      <div class="legend-item"><span class="legend-color present"></span>Present</div>
      <div class="legend-item"><span class="legend-color late"></span>Late</div>
      <div class="legend-item"><span class="legend-color half-day"></span>Half day</div>
      <div class="legend-item"><span class="legend-color absent"></span>Absent</div>
    </div>
  </div>
</div>` + nav('home');

const updates = header('', 'R') + `
<div class="content">
  <div class="page-header"><h2 class="page-title">Class Updates</h2></div>
  <div class="card">
    <div class="card-header"><h3 class="card-title">LKG - Ms. Priya</h3><span class="card-subtitle">Today</span></div>
    <div style="height:150px;border-radius:12px;background:linear-gradient(135deg,#4DB6AC,#00897B);display:flex;align-items:center;justify-content:center;font-size:56px;margin-bottom:12px">🎨</div>
    <p style="font-size:14px;color:#475569;line-height:1.5">We painted butterflies today and talked about the letter B. Please send an old shirt tomorrow for messy play.</p>
  </div>
  <div class="card">
    <div class="card-header"><h3 class="card-title">Homework</h3></div>
    <div class="activity-feed">
      <div class="activity-item"><div class="activity-icon activity">📗</div>
        <div class="activity-content"><div class="activity-title">Trace letter B</div>
        <div class="activity-description">Workbook page 14</div></div>
        <div class="activity-time">Due tomorrow</div></div>
      <div class="activity-item"><div class="activity-icon meal">🔢</div>
        <div class="activity-content"><div class="activity-title">Count to 20</div>
        <div class="activity-description">Practise aloud with a parent</div></div>
        <div class="activity-time">Due Fri</div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><h3 class="card-title">Notes for parents</h3></div>
    <div class="activity-feed">
      <div class="activity-item"><div class="activity-icon nap">🧃</div>
        <div class="activity-content"><div class="activity-title">Water bottle</div>
        <div class="activity-description">Please label it with your child's name</div></div></div>
    </div>
  </div>
</div>` + nav('home');

/* ---------- Frame ---------- */

const SCREENS = [
  { id: '1-parent-home', body: parentHome, cap: "Your child's whole day,<br>in one place" },
  { id: '2-attendance', body: attendance, cap: 'Mark attendance<br>in a single tap' },
  { id: '3-fees', body: fees, cap: 'Fees, receipts and<br>reminders — sorted' },
  { id: '4-admin', body: admin, cap: 'Run the whole school<br>from one dashboard' },
  { id: '5-analytics', body: analytics, cap: 'Attendance trends<br>at a glance' },
  { id: '6-updates', body: updates, cap: 'Class updates that<br>reach every parent' },
];

const SCREEN_W = 480, SCREEN_H = 854, SCALE = 1.7917;

for (const s of SCREENS) {
  // Screen doc: rendered inside a 480px-wide iframe so the app's own
  // `min-width: 768px` media query stays off and 100vh means 854px.
  fs.writeFileSync(`www/screen-${s.id}.html`, `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=${SCREEN_W}">
<link rel="stylesheet" href="/App.css">
<style>
  html,body{width:${SCREEN_W}px;height:${SCREEN_H}px;overflow:hidden;background:#f8fafc}
  .app-container,.main-layout{min-height:${SCREEN_H}px;height:${SCREEN_H}px;overflow:hidden}
  .header{position:static}
  .content{padding-bottom:88px}
  .page-header{padding:0 0 12px;border:0}
  .page-title{font-size:20px;font-weight:600}
</style></head><body>
<div class="app-container"><div class="main-layout">${s.body}</div></div>
</body></html>`);

  fs.writeFileSync(`www/${s.id}.html`, `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;width:1080px;height:1920px;overflow:hidden}
  body{background:linear-gradient(160deg,#00897B 0%,#00695C 55%,#004D40 100%);
       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  .cap{color:#fff;text-align:center;padding:86px 60px 0;font-size:56px;line-height:1.24;font-weight:700;letter-spacing:-.5px}
  .phone{position:absolute;left:50%;top:330px;transform:translateX(-50%);
         width:${Math.round(SCREEN_W * SCALE)}px;height:${Math.round(SCREEN_H * SCALE)}px;
         border-radius:44px;overflow:hidden;background:#f8fafc;
         box-shadow:0 40px 90px rgba(0,0,0,.42);border:3px solid rgba(255,255,255,.28)}
  .phone iframe{width:${SCREEN_W}px;height:${SCREEN_H}px;border:0;display:block;
                transform:scale(${SCALE});transform-origin:top left}
</style></head><body>
<div class="cap">${s.cap}</div>
<div class="phone"><iframe src="/screen-${s.id}.html" scrolling="no"></iframe></div>
</body></html>`);
}
console.log('built', SCREENS.length, 'screens');
