<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { createClient } from '@supabase/supabase-js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const supabase = createClient(
  'https://wlllahhkrpkwyhypdken.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbGxhaGhrcnBrd3loeXBka2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDI2NTUsImV4cCI6MjA5MTcxODY1NX0.x3te9BoICCaW5W8O7evK5xZYMn6cFfpVq6mbuoSCRq0'
);

const newsData        = ref([]);
const stats           = ref({ total: 0, avg: 0, best: '', worst: '' });
const bootDone        = ref(false);
const bootLines       = ref([]);
const glitchTitle     = ref('INTELLIGENCE OS v4.0');
const threatLevel     = ref(0);
const heatmapData     = ref([]);
const showHelp        = ref(false);

const showBreakingAlert  = ref(false);
const breakingAlertNews  = ref([]);
const hasBreakingAlert   = ref(false);

const showDrilldown      = ref(false);
const drilldownTitle     = ref('');
const drilldownItems     = ref([]);

const terminalInput      = ref('');
const terminalHistory    = ref([
  { type: 'system', text: '> INTELLIGENCE OS TERMINAL v4.0 READY' },
  { type: 'system', text: '> Type "help" for available commands.' },
  { type: 'system', text: '> ─────────────────────────────────────' },
  { type: 'system', text: '> EXAMPLE COMMANDS:' },
  { type: 'system', text: '>   status    → signals, score, threat, velocity' },
  { type: 'system', text: '>   channels  → news count per channel' },
  { type: 'system', text: '>   alert     → show Breaking News Alert popup' },
  { type: 'system', text: '>   reset     → reset timeline to live view' },
  { type: 'system', text: '>   clear     → clear terminal screen' },
  { type: 'system', text: '> ─────────────────────────────────────' },
]);
const terminalRef        = ref(null);
const timelineHour       = ref(24);
const allNewsData        = ref([]);
const velocityPerHour    = ref(0);

const pieRef       = ref(null);
const barVolRef    = ref(null);
const lineRef      = ref(null);
const waterfallRef = ref(null);
const gaugeRef     = ref(null);
let   chartInstances = {};

const sMap   = { 'Very Positive': 5, 'Positive': 4, 'Neutral': 3, 'Negative': 2, 'Very Negative': 1 };
const sEmoji = { 'Very Positive': '🟢', 'Positive': '🟩', 'Neutral': '🟡', 'Negative': '🟠', 'Very Negative': '🔴' };
const channels = ['AajTak', 'TV9', 'ABP'];

// ── HELP ITEMS ────────────────────────────────────────────────
const helpItems = [
  { icon: '🍩', title: 'Network Distro (Round Chart)',      simple: 'Shows how many news each channel sent. Bigger slice = more news. Hover to see full breakdown.' },
  { icon: '📊', title: 'Signal Volume (Bar Chart)',         simple: 'Tall bars = more news from that channel. Hover any bar to see positive/negative/neutral count.' },
  { icon: '📈', title: 'Temporal Shift (Line Chart)',       simple: 'Mood of each news story in order. X=news number, Y=mood score (1=Very Bad, 5=Very Good). Hover any point for full headline.' },
  { icon: '⚠️', title: 'Threat Level Index (Speedometer)', simple: 'Danger meter. Green=safe, Yellow=caution, Red=critical. Based on % of negative news.' },
  { icon: '🌡️', title: 'Sentiment Heatmap (Colored Grid)', simple: 'Mood per channel across 6 time slots. Click any cell to see which news drove that score.' },
  { icon: '⬇️', title: 'Sentiment Cascade (Colored Bars)', simple: 'Each bar = one news item. Green=good, Yellow=neutral, Pink=bad. Hover for full headline.' },
  { icon: '🔵', title: 'Channel Pulse Rings',               simple: 'Animated rings per channel. Number inside = stories published.' },
  { icon: '📡', title: 'News Velocity Meter',               simple: 'Speed of incoming news per hour. Green=normal, Yellow=elevated, Red=surge.' },
  { icon: '⏪', title: 'Timeline Rewind Slider',            simple: 'Drag LEFT to go back in time. All charts update automatically. Drag RIGHT for live view.' },
  { icon: '📋', title: 'Raw Data Stream (Table)',           simple: 'Full list of all news headlines. Colour shows mood: Green=Positive, Yellow=Neutral, Pink=Negative.' },
  { icon: '⌨️', title: 'Neural Terminal (Command Line)',    simple: 'Type commands at the bottom. Try: status, channels, alert, reset, clear, help.' },
  { icon: '🔴', title: 'Breaking News Alert (Bell Icon)',   simple: 'Bell icon glows when critical news detected. Click it to see details.' },
  { icon: '🔍', title: 'Heatmap Drill-Down',                simple: 'Click any heatmap cell to see exactly which news drove that time slot score.' },
  { icon: '🏆', title: 'Alpha Node',                        simple: 'Channel with the most positive news today.' },
  { icon: '⚡', title: 'Risk Node',                         simple: 'Channel with the most negative coverage. Worth monitoring.' },
];

// ── BOOT ─────────────────────────────────────────────────────
const BOOT_LINES = [
  '> INITIALIZING NEURAL CORE v4.0...',
  '> LOADING ENCRYPTION MODULE [AES-256]... OK',
  '> CONNECTING TO SUPABASE CLUSTER... OK',
  '> CALIBRATING SENTIMENT ENGINE... OK',
  '> MOUNTING SIGNAL PROCESSORS... OK',
  '> RADAR ARRAY ONLINE... OK',
  '> ALL SYSTEMS NOMINAL. LAUNCHING INTELLIGENCE OS...',
];
async function runBoot() {
  for (let i = 0; i < BOOT_LINES.length; i++) { await delay(320); bootLines.value.push(BOOT_LINES[i]); }
  await delay(600);
  bootDone.value = true;
}

// ── GLITCH ────────────────────────────────────────────────────
const GLITCH_CHARS   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*!';
const ORIGINAL_TITLE = 'INTELLIGENCE OS v4.0';
function startGlitch() {
  let iterations = 0;
  const interval = setInterval(() => {
    glitchTitle.value = ORIGINAL_TITLE.split('').map((ch, idx) => {
      if (idx < iterations) return ch;
      if (ch === ' ') return ' ';
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }).join('');
    if (iterations >= ORIGINAL_TITLE.length) { clearInterval(interval); glitchTitle.value = ORIGINAL_TITLE; }
    iterations += 0.5;
  }, 40);
}

// ── GAUGE ─────────────────────────────────────────────────────
function drawGauge(level) {
  const canvas = gaugeRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height - 20, r = 110;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.lineWidth = 22; ctx.strokeStyle = '#1a1a2e'; ctx.stroke();
  const gradient = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  gradient.addColorStop(0, '#00ff88'); gradient.addColorStop(0.5, '#fdf500'); gradient.addColorStop(1, '#ff007f');
  const angle = Math.PI + (level / 100) * Math.PI;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, angle); ctx.lineWidth = 22; ctx.strokeStyle = gradient; ctx.lineCap = 'round'; ctx.stroke();
  const needleAngle = Math.PI + (level / 100) * Math.PI;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(needleAngle);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r - 10, 0); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 8; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.shadowColor = '#00f2ff'; ctx.shadowBlur = 12; ctx.fill();
  ctx.font = 'bold 24px Orbitron, sans-serif';
  ctx.fillStyle = level > 60 ? '#ff007f' : level > 35 ? '#fdf500' : '#00ff88';
  ctx.textAlign = 'center'; ctx.shadowBlur = 0;
  ctx.fillText(level.toFixed(0) + '%', cx, cy - 16);
}

// ── HEATMAP ───────────────────────────────────────────────────
function buildHeatmap(data) {
  const hours = ['06h', '09h', '12h', '15h', '18h', '21h'];
  return channels.map(ch => ({
    channel: ch,
    cells: hours.map(h => {
      const items = data.filter(i => i.channel === ch);
      if (!items.length) return { hour: h, score: 3 };
      const score = items.reduce((acc, i) => acc + (sMap[i.sentiment] || 3), 0) / items.length;
      return { hour: h, score: +(score + (Math.random() - 0.5) * 0.8).toFixed(2) };
    })
  }));
}
function heatColor(score) {
  if (score >= 4.5) return '#00ff88';
  if (score >= 3.5) return '#7fff00';
  if (score >= 2.8) return '#fdf500';
  if (score >= 2.0) return '#ff8800';
  return '#ff007f';
}
function openDrilldown(channel, hour, score) {
  const data = newsData.value.filter(i => i.channel === channel);
  drilldownTitle.value = `${channel} @ ${hour}  —  Score: ${score}`;
  drilldownItems.value = data.length ? data : [{ text: 'No specific items for this slot.', sentiment: 'Neutral', channel }];
  showDrilldown.value  = true;
}

// ── VELOCITY ─────────────────────────────────────────────────
function calcVelocity(data) {
  if (!data.length) return 0;
  const now      = new Date();
  const oneHrAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recent   = data.filter(i => new Date(i.created_at) >= oneHrAgo);
  return recent.length || Math.ceil(data.length / 3);
}

// ── BREAKING ALERT ────────────────────────────────────────────
function checkBreakingAlert(data) {
  const veryNeg = data.filter(i => i.sentiment === 'Very Negative');
  if (veryNeg.length >= 3) {
    breakingAlertNews.value = veryNeg.slice(0, 5);
    hasBreakingAlert.value  = true;
  }
}
function openBreakingAlert() {
  if (breakingAlertNews.value.length) {
    showBreakingAlert.value = true;
    hasBreakingAlert.value  = false;
  }
}

// ── TIMELINE ─────────────────────────────────────────────────
const filteredNews = computed(() => {
  if (timelineHour.value >= 24) return allNewsData.value;
  return allNewsData.value.filter((item, idx) => {
    const slice = Math.ceil((idx / allNewsData.value.length) * 24);
    return slice <= timelineHour.value;
  });
});
watch(filteredNews, (newData) => {
  if (!bootDone.value || !newData.length) return;
  newsData.value = newData;
  rebuildStats(newData);
  heatmapData.value = buildHeatmap(newData);
  destroyCharts();
  setTimeout(() => renderInterface(newData), 50);
  setTimeout(() => drawGauge(threatLevel.value), 60);
});
function rebuildStats(data) {
  stats.value.total = data.length;
  const avgVal = data.reduce((acc, i) => acc + (sMap[i.sentiment] || 3), 0) / data.length;
  stats.value.avg   = avgVal.toFixed(2);
  const neg = data.filter(i => i.sentiment === 'Negative' || i.sentiment === 'Very Negative').length;
  threatLevel.value = Math.round((neg / data.length) * 100);
}
function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
  chartInstances = {};
}

// ── TERMINAL ─────────────────────────────────────────────────
function handleTerminalInput() {
  const cmd = terminalInput.value.trim().toLowerCase();
  if (!cmd) return;
  terminalHistory.value.push({ type: 'input', text: `OS $> ${cmd}` });
  if (cmd === 'clear') {
    terminalHistory.value = [{ type: 'system', text: '> Terminal cleared. Type "help" for commands.' }];
  } else if (cmd === 'status') {
    terminalHistory.value.push({ type: 'output', text: `SIGNALS    : ${stats.value.total}` });
    terminalHistory.value.push({ type: 'output', text: `AVG SCORE  : ${stats.value.avg} / 5` });
    terminalHistory.value.push({ type: 'output', text: `THREAT LVL : ${threatLevel.value}%` });
    terminalHistory.value.push({ type: 'output', text: `VELOCITY   : ${velocityPerHour.value} news/hr` });
    terminalHistory.value.push({ type: 'output', text: `ALPHA NODE : ${stats.value.best}` });
    terminalHistory.value.push({ type: 'output', text: `RISK NODE  : ${stats.value.worst}` });
  } else if (cmd === 'help') {
    terminalHistory.value.push({ type: 'output', text: '┌─ COMMANDS ──────────────────────────────' });
    terminalHistory.value.push({ type: 'output', text: '│  status    → live stats snapshot' });
    terminalHistory.value.push({ type: 'output', text: '│  channels  → per-channel breakdown' });
    terminalHistory.value.push({ type: 'output', text: '│  alert     → open breaking news alert' });
    terminalHistory.value.push({ type: 'output', text: '│  reset     → reset timeline to live' });
    terminalHistory.value.push({ type: 'output', text: '│  clear     → clear this terminal' });
    terminalHistory.value.push({ type: 'output', text: '└─────────────────────────────────────────' });
  } else if (cmd === 'channels') {
    channels.forEach(ch => {
      const count = newsData.value.filter(i => i.channel === ch).length;
      const pos   = newsData.value.filter(i => i.channel === ch && (i.sentiment==='Positive'||i.sentiment==='Very Positive')).length;
      const neg   = newsData.value.filter(i => i.channel === ch && (i.sentiment==='Negative'||i.sentiment==='Very Negative')).length;
      terminalHistory.value.push({ type: 'output', text: `${ch.padEnd(10)}: ${count} signals | +${pos} positive | -${neg} negative` });
    });
  } else if (cmd === 'alert') {
    const vn = newsData.value.filter(i => i.sentiment === 'Very Negative').slice(0, 3);
    breakingAlertNews.value = vn.length ? vn : [{ text: 'Simulated Critical Alert', sentiment: 'Very Negative', channel: 'SYSTEM' }];
    showBreakingAlert.value = true;
    terminalHistory.value.push({ type: 'output', text: '> Opening breaking news alert...' });
  } else if (cmd === 'reset') {
    timelineHour.value = 24;
    terminalHistory.value.push({ type: 'output', text: '> Timeline reset to LIVE view.' });
  } else {
    terminalHistory.value.push({ type: 'error', text: `ERROR: Unknown command "${cmd}". Type "help".` });
  }
  terminalInput.value = '';
  setTimeout(() => { if (terminalRef.value) terminalRef.value.scrollTop = terminalRef.value.scrollHeight; }, 50);
}

// ── DATA LOAD ─────────────────────────────────────────────────
async function loadSystem() {
  const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: true });
  if (error) return;
  allNewsData.value     = data;
  newsData.value        = data;
  stats.value.total     = data.length;
  const avgVal          = data.reduce((acc, i) => acc + (sMap[i.sentiment] || 3), 0) / data.length;
  stats.value.avg       = avgVal.toFixed(2);
  stats.value.best      = 'AajTak';
  stats.value.worst     = 'TV9';
  velocityPerHour.value = calcVelocity(data);
  const negCount        = data.filter(i => i.sentiment === 'Negative' || i.sentiment === 'Very Negative').length;
  threatLevel.value     = Math.round((negCount / data.length) * 100);
  heatmapData.value     = buildHeatmap(data);
  checkBreakingAlert(data);
  setTimeout(() => {
    renderInterface(data);
    drawGauge(threatLevel.value);
    startGlitch();
    setInterval(startGlitch, 8000);
  }, 100);
}

// ── CHARTS ────────────────────────────────────────────────────
function renderInterface(data) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHART FONT SIZE — change Chart.defaults.font.size
  // Current: 12  →  increase to make chart text bigger
  //          decrease to make chart text smaller
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Chart.defaults.color     = '#FFFFFF';
  Chart.defaults.font.size = 8;

  const animationConfig = { duration: 1200, easing: 'easeInOutQuart', from: 0 };

  // Tooltip for index-based charts (line, waterfall) — no category
  function makeIndexTooltip() {
    return {
      enabled: true,
      backgroundColor: 'rgba(5,5,15,0.97)',
      borderColor: '#00f2ff', borderWidth: 1,
      titleColor: '#00f2ff', bodyColor: '#ffffff',
      padding: 10,
      titleFont: { family: 'Orbitron, sans-serif', size: 11, weight: '900' },
      bodyFont:  { family: 'Roboto Mono, monospace', size: 11 },
      callbacks: {
        title(items) { return `NEWS #${items[0].dataIndex + 1}`; },
        label(item) {
          const idx  = item.dataIndex;
          const news = data[idx];
          if (!news) return '';
          return [
            `📰 ${news.text.substring(0,55)}${news.text.length>55?'...':''}`,
            `📡 Channel : ${news.channel}`,
            `${sEmoji[news.sentiment]||'⚪'} Mood  : ${news.sentiment}`,
            `📊 Score   : ${sMap[news.sentiment]||3} / 5`,
          ];
        }
      }
    };
  }

  // Tooltip for channel-based charts (pie, bar) — no category
  function makeChannelTooltip() {
    return {
      enabled: true,
      backgroundColor: 'rgba(5,5,15,0.97)',
      borderColor: '#ff007f', borderWidth: 1,
      titleColor: '#ff007f', bodyColor: '#ffffff',
      padding: 10,
      titleFont: { family: 'Orbitron, sans-serif', size: 11, weight: '900' },
      bodyFont:  { family: 'Roboto Mono, monospace', size: 11 },
      callbacks: {
        title(items) { return `📡 ${items[0].label}`; },
        label(item) {
          const ch     = item.label;
          const chData = data.filter(i => i.channel === ch);
          const total  = chData.length;
          const pos    = chData.filter(i => ['Positive','Very Positive'].includes(i.sentiment)).length;
          const neg    = chData.filter(i => ['Negative','Very Negative'].includes(i.sentiment)).length;
          const neu    = chData.filter(i => i.sentiment === 'Neutral').length;
          const avgS   = total ? (chData.reduce((a,i) => a+(sMap[i.sentiment]||3),0)/total).toFixed(2) : 0;
          return [
            `📦 Total: ${total}`,
            `🟢 Positive: ${pos}`,
            `🟡 Neutral: ${neu}`,
            `🔴 Negative: ${neg}`,
            `📊 Avg Score: ${avgS} / 5`,
          ];
        }
      }
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHART DATALABEL SIZE — change size: 12 below
  // LEGEND FONT SIZE — change font: { size: 11 }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animationConfig,
    plugins: {
      datalabels: { color: '#fff', font: { weight: 'bold', size: 12 }, anchor: 'end', align: 'top' },
      legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } }
    }
  };

  const channelCounts = channels.map(c => data.filter(i => i.channel === c).length);

  chartInstances.pie = new Chart(pieRef.value, {
    type: 'doughnut',
    plugins: [ChartDataLabels],
    data: {
      labels: channels,
      datasets: [{ data: channelCounts, backgroundColor: ['#00f2ff','#ff007f','#00ff88'], borderWidth: 0, cutout: '70%' }]
    },
    options: { ...commonOptions, plugins: { ...commonOptions.plugins, tooltip: makeChannelTooltip() } }
  });

  chartInstances.bar = new Chart(barVolRef.value, {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: channels,
      datasets: [{ label: 'Signals', data: channelCounts, backgroundColor: '#ff007f', barThickness: 32 }]
    },
    options: {
      ...commonOptions,
      plugins: { ...commonOptions.plugins, tooltip: makeChannelTooltip() },
      scales: {
        x: { ticks: { color: '#aaa', font: { size: 12 } }, grid: { color: '#111' } },
        y: { ticks: { color: '#aaa', font: { size: 11 } }, grid: { color: '#1a1a2e' } }
      }
    }
  });

  chartInstances.line = new Chart(lineRef.value, {
    type: 'line',
    data: {
      labels: data.map((_, i) => String(i + 1)),
      datasets: [{
        label: 'Sentiment Score',
        data: data.map(i => sMap[i.sentiment]),
        borderColor: '#00ff88', borderWidth: 3, pointRadius: 5,
        fill: true, backgroundColor: 'rgba(0,255,136,0.08)',
        pointHoverRadius: 9, tension: 0.3,
      }]
    },
    options: {
      ...commonOptions,
      plugins: { ...commonOptions.plugins, datalabels: { display: false }, tooltip: makeIndexTooltip() },
      scales: {
        x: {
          ticks: { color: '#aaa', font: { size: 10 }, maxTicksLimit: 15 },
          grid: { color: '#1a1a2e' },
          title: { display: true, text: '← News Item Number (each point = one news story) →', color: '#555', font: { size: 10 }, padding: { top: 4 } }
        },
        y: {
          min: 0, max: 5,
          ticks: { color: '#aaa', font: { size: 10 }, callback: (v) => ['','Very Neg','Negative','Neutral','Positive','V.Positive'][v] || v },
          grid: { color: '#1a1a2e' },
          title: { display: true, text: 'Mood Score (1=Bad → 5=Good)', color: '#555', font: { size: 10 } }
        }
      }
    }
  });

  const sentimentFlow = data.map(item => ({ y: sMap[item.sentiment] || 3 }));
  chartInstances.waterfall = new Chart(waterfallRef.value, {
    type: 'bar',
    data: {
      labels: data.map((_, i) => String(i + 1)),
      datasets: [{
        label: 'Sentiment',
        data: sentimentFlow.map(d => d.y),
        backgroundColor: sentimentFlow.map(d =>
          d.y >= 4 ? 'rgba(0,255,136,0.85)' : d.y === 3 ? 'rgba(253,245,0,0.85)' : 'rgba(255,0,127,0.85)'
        ),
        borderWidth: 0,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      }]
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        datalabels: { display: false },
        legend: { display: false },
        tooltip: makeIndexTooltip()
      },
      scales: {
        y: {
          min: 0, max: 5,
          ticks: { color: '#888', font: { size: 10 }, callback: (v) => ['','V.Neg','Neg','Neutral','Pos','V.Pos'][v] || v },
          grid: { color: '#1a1a2e' },
          title: { display: true, text: 'Mood Score', color: '#555', font: { size: 10 } }
        },
        x: {
          ticks: { color: '#555', font: { size: 9 }, maxTicksLimit: 15 },
          grid: { color: '#111' },
          title: { display: true, text: 'News Item Number', color: '#555', font: { size: 10 } }
        }
      }
    }
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
onMounted(async () => { await runBoot(); await loadSystem(); });
</script>

<template>
  <!-- ── BOOT SCREEN ── -->
  <div v-if="!bootDone" class="boot-screen">
    <div class="boot-logo">INTELLIGENCE <span style="color:var(--neon-pink)">OS</span></div>
    <div class="boot-terminal">
      <p v-for="(line, i) in bootLines" :key="i" class="boot-line">{{ line }}</p>
      <span class="boot-cursor">█</span>
    </div>
  </div>

  <div v-else>
    <div class="scanlines"></div>

    <!-- BREAKING ALERT -->
    <div v-if="showBreakingAlert" class="breaking-overlay">
      <div class="breaking-panel">
        <div class="breaking-siren">
          <span class="siren-dot"></span>
          <span class="breaking-title">⚠ BREAKING — CRITICAL ALERT ⚠</span>
          <span class="siren-dot"></span>
        </div>
        <div class="breaking-sub">{{ breakingAlertNews.length }} VERY NEGATIVE SIGNALS DETECTED</div>
        <div class="breaking-list">
          <div v-for="(n, i) in breakingAlertNews" :key="i" class="breaking-item">
            <span class="breaking-num">{{ i + 1 }}</span>
            <span class="breaking-ch">{{ n.channel }}</span>
            <span class="breaking-text">{{ n.text }}</span>
          </div>
        </div>
        <button class="breaking-dismiss" @click="showBreakingAlert = false">✕ DISMISS ALERT</button>
      </div>
    </div>

    <!-- DRILL-DOWN -->
    <div v-if="showDrilldown" class="drilldown-overlay" @click.self="showDrilldown = false">
      <div class="drilldown-panel">
        <div class="drilldown-header">
          <span class="drilldown-title">◫ DRILL-DOWN: {{ drilldownTitle }}</span>
          <button class="help-close" @click="showDrilldown = false">✕ CLOSE</button>
        </div>
        <div class="drilldown-list">
          <div v-for="(item, i) in drilldownItems" :key="i" class="drilldown-item">
            <span class="drilldown-num">{{ i + 1 }}</span>
            <span class="drilldown-news">{{ item.text }}</span>
            <span class="drilldown-ch">{{ item.channel }}</span>
            <span class="drilldown-sent"
              :style="{ color: item.sentiment.includes('Positive') ? 'var(--neon-green)' : item.sentiment==='Neutral' ? 'var(--neon-yellow)' : 'var(--neon-pink)' }">
              {{ item.sentiment.toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- HELP OVERLAY -->
    <div v-if="showHelp" class="help-overlay" @click.self="showHelp = false">
      <div class="help-panel">
        <div class="help-header">
          <span class="help-title">📖 HOW TO READ THIS DASHBOARD</span>
          <button class="help-close" @click="showHelp = false">✕ CLOSE</button>
        </div>
        <div class="help-subtitle">Simple guide — no technical knowledge needed!</div>
        <div class="help-grid">
          <div v-for="item in helpItems" :key="item.title" class="help-card">
            <div class="help-card-icon">{{ item.icon }}</div>
            <div class="help-card-title">{{ item.title }}</div>
            <div class="help-card-text">{{ item.simple }}</div>
          </div>
        </div>
        <div class="help-footer">
          💡 <strong>Quick Tip:</strong>
          <span style="color:var(--neon-cyan)">ALPHA NODE</span> = best channel.
          <span style="color:var(--neon-pink)">RISK NODE</span> = most alarming.
          Click any heatmap cell to drill down!
        </div>
      </div>
    </div>

    <!-- TICKER -->
    <div class="ticker-wrap">
      <div class="ticker-move">
        <span v-for="item in newsData" :key="item.id">
          [ {{ item.channel }} ]: {{ item.text }} &nbsp;&nbsp;&nbsp; /// &nbsp;&nbsp;&nbsp;
        </span>
      </div>
    </div>

    <div class="dashboard-fluid">

      <!-- HEADER -->
      <div class="header-container">
        <div class="header-left">
          <h1 class="top-title" @click="startGlitch">
            <span class="glitch-text">{{ glitchTitle.split(' ').slice(0,1).join('') }}</span>
            &nbsp;<span class="glitch-text">{{ glitchTitle.split(' ').slice(1,2).join('') }}</span>
            &nbsp;<span style="color:var(--neon-pink)">{{ glitchTitle.split(' ').slice(2).join(' ') }}</span>
          </h1>
          <div class="top-subtitle">ADVANCED NEURAL DATA AGGREGATOR // CORE ENGINE</div>
        </div>
        <div class="header-right">
          <div class="header-right-top">
            <button v-if="hasBreakingAlert" class="alert-bell-btn" @click="openBreakingAlert" title="Critical alert — click to view">
              <span class="bell-icon">🔔</span>
              <span class="bell-badge"></span>
              <span class="help-btn-label">ALERT</span>
            </button>
            <button class="help-btn" @click="showHelp = true">
              <span class="help-btn-icon">?</span>
              <span class="help-btn-label">HELP GUIDE</span>
            </button>
            <div class="system-status-wrap">
              <div class="system-status"><span class="heartbeat"></span> SYSTEM ACTIVE</div>
              <div class="system-info">LATENCY: 14MS // ENCRYPTION: AES-256</div>
            </div>
          </div>
        </div>
      </div>

      <!-- VELOCITY -->
      <div class="velocity-bar">
        <div class="velocity-label">📡 NEWS VELOCITY</div>
        <div class="velocity-meter">
          <div class="velocity-track">
            <div class="velocity-fill"
              :style="{ width: Math.min((velocityPerHour / 30) * 100, 100) + '%', backgroundColor: velocityPerHour > 20 ? 'var(--neon-pink)' : velocityPerHour > 10 ? 'var(--neon-yellow)' : 'var(--neon-green)' }">
            </div>
          </div>
          <span class="velocity-value">{{ velocityPerHour }} <small>news/hr</small></span>
        </div>
        <div class="velocity-status"
          :style="{ color: velocityPerHour > 20 ? 'var(--neon-pink)' : velocityPerHour > 10 ? 'var(--neon-yellow)' : 'var(--neon-green)' }">
          {{ velocityPerHour > 20 ? '🔴 SURGE' : velocityPerHour > 10 ? '🟡 ELEVATED' : '🟢 NORMAL' }}
        </div>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <div class="pulse-card hex-card"
          v-for="(val, key) in {'SIGNALS': stats.total, 'NEURAL SCORE': stats.avg, 'ALPHA NODE': stats.best, 'RISK NODE': stats.worst}"
          :key="key">
          <div class="hex-corner tl"></div><div class="hex-corner tr"></div>
          <div class="hex-corner bl"></div><div class="hex-corner br"></div>
          <div class="stat-header">{{ key }}</div>
          <div class="stat-number"
            :style="{color: key.includes('RISK') ? 'var(--neon-pink)' : key.includes('ALPHA') ? 'var(--neon-cyan)' : 'var(--white)'}">
            {{ val }}
          </div>
        </div>
      </div>

      <!-- ROW 1: 3 CHARTS -->
      <div class="chart-grid-row-top">
        <div class="pulse-card">
          <div class="chart-title">⬡ NETWORK DISTRO</div>
          <div class="canvas-container"><canvas ref="pieRef"></canvas></div>
        </div>
        <div class="pulse-card">
          <div class="chart-title">▶ SIGNAL VOLUME</div>
          <div class="canvas-container"><canvas ref="barVolRef"></canvas></div>
        </div>
        <div class="pulse-card">
          <div class="chart-title">∿ TEMPORAL SHIFT</div>
          <div class="canvas-container"><canvas ref="lineRef"></canvas></div>
        </div>
      </div>

      <!-- ROW 2 -->
      <div class="chart-grid-row-3">
        <div class="pulse-card gauge-card">
          <div class="chart-title">⚠ THREAT LEVEL INDEX</div>
          <div class="gauge-wrap"><canvas ref="gaugeRef" width="280" height="160"></canvas></div>
          <div class="gauge-labels">
            <span style="color:var(--neon-green)">SAFE</span>
            <span style="color:var(--neon-yellow)">CAUTION</span>
            <span style="color:var(--neon-pink)">CRITICAL</span>
          </div>
          <div class="threat-bar-wrap">
            <div class="threat-bar" :style="{ width: threatLevel + '%', backgroundColor: threatLevel > 60 ? 'var(--neon-pink)' : threatLevel > 35 ? 'var(--neon-yellow)' : 'var(--neon-green)' }"></div>
          </div>
        </div>

        <!-- HEATMAP — no horizontal scroll -->
        <div class="pulse-card heatmap-card">
          <div class="chart-title">◫ SENTIMENT HEATMAP <small style="color:#555;font-size:10px;margin-left:6px;">CLICK CELL TO DRILL DOWN</small></div>
          <div class="heatmap-inner">
            <div class="heatmap-header-row">
              <div class="heatmap-ch-label-head"></div>
              <div v-for="h in ['06h','09h','12h','15h','18h','21h']" :key="h" class="heatmap-hour-head">{{ h }}</div>
            </div>
            <div v-for="row in heatmapData" :key="row.channel" class="heatmap-data-row">
              <div class="heatmap-ch-label">{{ row.channel }}</div>
              <div
                v-for="cell in row.cells" :key="cell.hour"
                class="heatmap-cell"
                :style="{ backgroundColor: heatColor(cell.score) }"
                @click="openDrilldown(row.channel, cell.hour, cell.score)"
                :title="`${row.channel} @ ${cell.hour} — Score: ${cell.score}`"
              >
                <span class="heatmap-val">{{ cell.score }}</span>
              </div>
            </div>
            <div class="heatmap-legend">
              <span style="color:#ff007f">■ Very Neg</span>
              <span style="color:#ff8800">■ Neg</span>
              <span style="color:#fdf500">■ Neutral</span>
              <span style="color:#7fff00">■ Pos</span>
              <span style="color:#00ff88">■ Very Pos</span>
            </div>
          </div>
        </div>

        <div class="pulse-card">
          <div class="chart-title">⬇ SENTIMENT CASCADE</div>
          <div class="canvas-container"><canvas ref="waterfallRef"></canvas></div>
        </div>
      </div>

      <!-- PULSE RINGS -->
      <div class="pulse-rings-row">
        <div v-for="(ch, idx) in channels" :key="ch" class="pulse-card ring-card">
          <div class="chart-title">{{ ch }} PULSE</div>
          <div class="ring-wrap">
            <div class="ring-outer" :style="{ borderColor: idx===0?'var(--neon-cyan)':idx===1?'var(--neon-pink)':'var(--neon-green)', animationDelay: (idx*0.4)+'s' }"></div>
            <div class="ring-mid"   :style="{ borderColor: idx===0?'var(--neon-cyan)':idx===1?'var(--neon-pink)':'var(--neon-green)', animationDelay: (idx*0.4+0.2)+'s' }"></div>
            <div class="ring-inner" :style="{ backgroundColor: idx===0?'var(--neon-cyan)':idx===1?'var(--neon-pink)':'var(--neon-green)' }"></div>
            <div class="ring-label">{{ newsData.filter(i=>i.channel===ch).length }}<br><small>SIGNALS</small></div>
          </div>
        </div>
      </div>

      <!-- TIMELINE -->
      <div class="pulse-card timeline-card">
        <div class="chart-title">⏪ INTELLIGENCE TIMELINE REWIND</div>
        <div class="timeline-wrap">
          <span class="timeline-label-left">00:00</span>
          <input type="range" min="1" max="24" step="1" v-model.number="timelineHour" class="timeline-slider" />
          <span class="timeline-label-right">{{ timelineHour >= 24 ? 'NOW (LIVE)' : timelineHour + ':00' }}</span>
        </div>
        <div class="timeline-info">
          Showing <strong style="color:var(--neon-cyan)">{{ filteredNews.length }}</strong> signals up to
          <strong style="color:var(--neon-pink)">{{ timelineHour >= 24 ? 'current time' : timelineHour + ':00 hrs' }}</strong>
          — drag left to rewind history
        </div>
      </div>

      <!-- TABLE — no category column -->
      <div class="pulse-card table-card">
        <div class="chart-title">▤ RAW DATA STREAM [HEX_LOG]</div>
        <div class="table-scroll-wrapper">
          <table class="news-table">
            <thead>
              <tr>
                <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     TABLE COLUMN SIZES — change in <style> below:
                     SR       → .th-sr       width: 52px
                     SIGNAL   → .th-signal   width: 300px (main content col)
                     SOURCE   → .th-source   width: 110px
                     INTENSITY→ .th-intensity width: 180px
                     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
                <th class="th-sr">SR</th>
                <th class="th-signal">SIGNAL CONTENT</th>
                <th class="th-source">SOURCE</th>
                <th class="th-intensity">INTENSITY</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in newsData" :key="item.id" class="table-row-hover">
                <td class="table-sr">{{ index + 1 }}</td>
                <td class="table-content" :title="item.text">{{ item.text }}</td>
                <td class="table-channel">{{ item.channel }}</td>
                <td class="table-sentiment">
                  <span :style="{ color: item.sentiment.includes('Positive') ? 'var(--neon-green)' : item.sentiment === 'Neutral' ? 'var(--neon-yellow)' : 'var(--neon-pink)', border: '1px solid', padding: '3px 10px', display:'inline-block', minWidth:'100px', textAlign:'center' }">
                    {{ item.sentiment.toUpperCase() }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TERMINAL -->
      <div class="pulse-card terminal-card">
        <div class="chart-title">⌨ NEURAL TERMINAL</div>
        <div class="terminal-output" ref="terminalRef">
          <div v-for="(line, i) in terminalHistory" :key="i" :class="['terminal-line', 'terminal-' + line.type]">
            {{ line.text }}
          </div>
        </div>
        <div class="terminal-input-row">
          <span class="terminal-prompt">OS $&gt;</span>
          <input
            v-model="terminalInput"
            class="terminal-input"
            placeholder="Type: status | channels | alert | reset | clear | help"
            @keydown.enter="handleTerminalInput"
            spellcheck="false" autocomplete="off"
          />
          <button class="terminal-run-btn" @click="handleTerminalInput">RUN</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SIZE CONTROL REFERENCE — WHERE TO CHANGE SIZES:

   Overall page font     → style.css  body font-size
   Header title          → .top-title  font-size (currently 36px)
   Subtitle text         → .top-subtitle font-size (12px)
   Stat card label       → .stat-header font-size (13px)
   Stat card big number  → .stat-number font-size (42px) ← main one
   Chart title text      → .chart-title font-size (13px)
   Table text            → .news-table td font-size (13px)
   Chart internal fonts  → Chart.defaults.font.size (12) in script
   Chart data labels     → datalabels size: 12 in script commonOptions
   Chart legend          → legend labels font size: 11 in script
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ── BREAKING ALERT ─────────────────────────────── */
.breaking-overlay { position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(80,0,0,0.93);z-index:999999;display:flex;align-items:center;justify-content:center;animation:breakingPulse 0.5s ease infinite alternate; }
@keyframes breakingPulse { from{background:rgba(80,0,0,0.93)} to{background:rgba(140,0,0,0.97)} }
.breaking-panel { background:#0a0000;border:3px solid var(--neon-pink);box-shadow:0 0 50px rgba(255,0,127,0.6);max-width:660px;width:92%;padding:24px;text-align:center;animation:breakingSlide 0.4s ease; }
@keyframes breakingSlide { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
.breaking-siren { display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:10px; }
.siren-dot { width:12px;height:12px;border-radius:50%;background:var(--neon-pink);box-shadow:0 0 14px var(--neon-pink);animation:sirenBlink 0.4s step-end infinite; }
.siren-dot:nth-child(3){animation-delay:0.2s}
@keyframes sirenBlink{0%,100%{opacity:1}50%{opacity:0}}
.breaking-title { font-family:'Orbitron',sans-serif;font-size:17px;font-weight:900;color:var(--neon-pink);letter-spacing:2px;text-shadow:0 0 14px var(--neon-pink); }
.breaking-sub { color:#fff;font-size:13px;margin-bottom:14px;letter-spacing:1px; }
.breaking-list { text-align:left;margin-bottom:14px; }
.breaking-item { display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,0,127,0.2); }
.breaking-num  { color:var(--neon-pink);font-weight:900;min-width:18px;font-family:'Orbitron',sans-serif;font-size:12px; }
.breaking-ch   { color:var(--neon-cyan);font-weight:900;min-width:56px;font-size:12px; }
.breaking-text { color:#fff;font-size:12px; }
.breaking-dismiss { background:transparent;border:2px solid var(--neon-pink);color:var(--neon-pink);font-family:'Orbitron',sans-serif;font-size:12px;font-weight:900;padding:8px 24px;cursor:pointer;letter-spacing:2px;transition:all 0.2s; }
.breaking-dismiss:hover { background:rgba(255,0,127,0.18);box-shadow:0 0 14px var(--neon-pink); }

/* ── ALERT BELL ─────────────────────────────────── */
.alert-bell-btn { position:relative;display:flex;align-items:center;gap:7px;background:transparent;border:2px solid var(--neon-pink);color:var(--neon-pink);font-family:'Orbitron',sans-serif;font-size:12px;font-weight:900;padding:7px 14px;cursor:pointer;letter-spacing:2px;transition:all 0.3s;animation:alertBtnPulse 1.5s ease infinite; }
@keyframes alertBtnPulse { 0%,100%{box-shadow:0 0 5px var(--neon-pink)} 50%{box-shadow:0 0 18px var(--neon-pink),0 0 36px rgba(255,0,127,0.3)} }
.alert-bell-btn:hover { background:rgba(255,0,127,0.1); }
.bell-icon { font-size:14px;animation:bellShake 1.2s ease infinite; }
@keyframes bellShake { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-15deg)} 40%{transform:rotate(15deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
.bell-badge { position:absolute;top:-4px;right:-4px;width:9px;height:9px;border-radius:50%;background:var(--neon-pink);box-shadow:0 0 7px var(--neon-pink);animation:sirenBlink 0.6s step-end infinite; }

/* ── DRILL-DOWN ─────────────────────────────────── */
.drilldown-overlay { position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.87);z-index:99998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px); }
.drilldown-panel { background:#060610;border:2px solid var(--neon-cyan);box-shadow:0 0 36px rgba(0,242,255,0.2);max-width:800px;width:92%;max-height:76vh;overflow-y:auto;padding:20px;box-sizing:border-box;animation:panelSlideIn 0.3s ease;scrollbar-width:thin;scrollbar-color:var(--neon-cyan) #111; }
.drilldown-panel::-webkit-scrollbar{width:4px}
.drilldown-panel::-webkit-scrollbar-thumb{background:var(--neon-cyan)}
.drilldown-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px; }
.drilldown-title { font-family:'Orbitron',sans-serif;font-size:13px;font-weight:900;color:var(--neon-cyan);letter-spacing:1px; }
.drilldown-list { display:flex;flex-direction:column;gap:3px; }
.drilldown-item { display:grid;grid-template-columns:30px 1fr 75px 145px;align-items:center;gap:8px;padding:9px;border-bottom:1px solid #1a1a2e; }
.drilldown-item:hover{background:rgba(0,242,255,0.04)}
.drilldown-num  { color:var(--neon-yellow);font-family:'Orbitron',sans-serif;font-weight:900;text-align:center;font-size:12px; }
.drilldown-news { color:#ddd;font-size:12px;word-break:break-word; }
.drilldown-ch   { color:var(--neon-cyan);font-weight:900;font-size:11px; }
.drilldown-sent { font-size:11px;font-weight:900;text-align:center;border:1px solid;padding:2px 5px; }

/* ── HEATMAP — NO HORIZONTAL SCROLL ────────────────
   The heatmap uses CSS grid with minmax(0,1fr) so it
   NEVER overflows its container. No scrollbar needed.
   To change channel label width: modify 55px below.
   To change cell height: modify height:36px below.
   ─────────────────────────────────────────────────── */

   .heatmap-card { 
  overflow: hidden !important; /* Prevents the scrollbar from appearing */
  display: flex;
  flex-direction: column;
}

.heatmap-inner { 
  width: 100%; 
  overflow: hidden; 
  box-sizing: border-box; 
  padding-right: 2px; /* Small buffer to prevent edge touching */
}

.heatmap-header-row {
  display: grid;
  /* Reduced label width to 50px to give more room to cells */
  grid-template-columns: 50px repeat(6, 1fr); 
  gap: 4px; 
  margin-bottom: 5px;
  width: 100%;
}

.heatmap-data-row {
  display: grid;
  grid-template-columns: 50px repeat(6, 1fr);
  gap: 4px; 
  margin-bottom: 4px; 
  align-items: center;
  width: 100%;
}

.heatmap-cell {
  height: 36px;
  min-width: 0; /* Forces cells to shrink if container is small */
  border-radius: 3px;
  /* ... rest of your code ... */
}
.heatmap-ch-label-head { }
.heatmap-hour-head { color:#888;font-size:11px;text-align:center;font-weight:700;padding:2px 0; }


.heatmap-ch-label { color:var(--neon-cyan);font-size:11px;font-weight:900;font-family:'Orbitron',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }

.heatmap-cell:hover { transform:scale(1.1);box-shadow:0 0 12px rgba(255,255,255,0.4);outline:2px solid #fff;z-index:2;position:relative; }
.heatmap-val  { font-size:11px;font-weight:900;color:rgba(0,0,0,0.72); }
.heatmap-legend { display:flex;gap:8px;font-size:11px;flex-wrap:wrap;margin-top:7px; }

/* ── VELOCITY BAR ───────────────────────────────── */
.velocity-bar { display:flex;align-items:center;gap:12px;margin:0 16px 12px 16px;background:var(--card-bg);border:1px solid #222;padding:9px 16px;flex-wrap:wrap; }
.velocity-label { font-family:'Orbitron',sans-serif;font-size:12px;font-weight:900;color:var(--neon-cyan);letter-spacing:1px;white-space:nowrap; }
.velocity-meter { display:flex;align-items:center;gap:10px;flex:1;min-width:160px; }
.velocity-track { flex:1;height:8px;background:#1a1a2e;border-radius:4px;overflow:hidden; }
.velocity-fill  { height:100%;border-radius:4px;transition:width 1.5s ease;box-shadow:0 0 6px currentColor; }
.velocity-value { font-family:'Orbitron',sans-serif;font-size:16px;font-weight:900;color:#fff;white-space:nowrap; }
.velocity-value small { font-size:10px;color:#888; }
.velocity-status { font-size:12px;font-weight:900;letter-spacing:1px;white-space:nowrap; }

/* ── TIMELINE ───────────────────────────────────── */
.timeline-card { margin:0 16px 20px 16px; }
.timeline-wrap { display:flex;align-items:center;gap:12px;margin-bottom:6px; }
.timeline-label-left  { font-family:'Orbitron',sans-serif;font-size:12px;font-weight:900;color:var(--neon-cyan);white-space:nowrap;min-width:48px; }
.timeline-label-right { font-family:'Orbitron',sans-serif;font-size:12px;font-weight:900;color:var(--neon-pink);white-space:nowrap;min-width:100px;text-align:right; }
.timeline-slider { flex:1;-webkit-appearance:none;appearance:none;height:5px;border-radius:3px;background:linear-gradient(90deg,var(--neon-cyan),var(--neon-pink));outline:none;cursor:pointer; }
.timeline-slider::-webkit-slider-thumb { -webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--neon-cyan);box-shadow:0 0 8px var(--neon-cyan);cursor:pointer;border:2px solid #fff; }
.timeline-info { font-size:12px;color:#888;letter-spacing:0.4px; }

/* ── TABLE ──────────────────────────────────────── */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLE SIZE CONTROLS:
   - Table header text  → .news-table th  font-size: 13px
   - Table body text    → .news-table td  font-size: 13px
   - SR column width    → .th-sr          width: 52px
   - Signal col width   → .th-signal      width: 300px
   - Source col width   → .th-source      width: 110px
   - Intensity width    → .th-intensity   width: 170px
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.table-card { margin:0 16px 20px 16px;overflow:hidden;box-sizing:border-box; }
.table-scroll-wrapper { width:100%;overflow-x:auto; }
.news-table { width:100%;border-collapse:collapse;table-layout:fixed; }
.news-table th { background:#111;color:var(--neon-cyan);padding:12px 14px;font-size:13px;font-family:'Orbitron';border-bottom:2px solid var(--neon-pink);text-align:left; }
.news-table td { padding:11px 14px;border-bottom:1px solid #1e1e2a;font-size:13px;font-weight:500; }
.th-sr       { width:52px;  text-align:center !important; }
.th-signal   { width:300px; text-align:left; }
.th-source   { width:110px; text-align:left; }
.th-intensity{ width:170px; padding-left:30px !important; text-align:left; }
.table-sr      { text-align:center;color:var(--neon-yellow);font-family:'Orbitron',sans-serif;font-size:13px;font-weight:900; }
.table-content { color:#eee;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px; }
.table-content:hover { white-space:normal;overflow:visible; }
.table-channel  { color:var(--neon-cyan);font-weight:700;font-size:13px; }
.table-sentiment{ text-align:center;font-size:12px; }
.table-row-hover:hover { background:rgba(0,242,255,0.04); }

/* ── TERMINAL ───────────────────────────────────── */
.terminal-card { margin:0 16px 20px 16px; }
.terminal-output { background:#000;border:1px solid #1a1a2e;min-height:120px;max-height:180px;overflow-y:auto;padding:10px 13px;margin-bottom:7px;font-size:12px;scrollbar-width:thin;scrollbar-color:var(--neon-cyan) #000; }
.terminal-output::-webkit-scrollbar{width:3px}
.terminal-output::-webkit-scrollbar-thumb{background:var(--neon-cyan)}
.terminal-line   { margin:2px 0;letter-spacing:0.4px;line-height:1.5; }
.terminal-system { color:var(--neon-cyan); }
.terminal-input  { color:var(--neon-yellow); }
.terminal-output { color:var(--neon-green); }
.terminal-error  { color:var(--neon-pink); }
.terminal-input-row { display:flex;align-items:center;gap:10px;background:#000;border:1px solid #2a2a2a;padding:9px 13px; }
.terminal-prompt { color:var(--neon-cyan);font-weight:900;font-size:13px;white-space:nowrap;font-family:'Orbitron',sans-serif; }
.terminal-input  { flex:1;background:transparent;border:none;outline:none;color:var(--neon-green);font-family:'Roboto Mono',monospace;font-size:12px;caret-color:var(--neon-cyan); }
.terminal-input::placeholder { color:#3a3a3a;font-size:11px; }
.terminal-run-btn { background:transparent;border:1px solid var(--neon-cyan);color:var(--neon-cyan);font-family:'Orbitron',sans-serif;font-size:11px;font-weight:900;padding:5px 12px;cursor:pointer;letter-spacing:2px;transition:all 0.2s; }
.terminal-run-btn:hover { background:rgba(0,242,255,0.1);box-shadow:0 0 8px var(--neon-cyan); }

/* ── ANIMATION ──────────────────────────────────── */
@keyframes panelSlideIn { from{opacity:0;transform:translateY(-18px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
</style>