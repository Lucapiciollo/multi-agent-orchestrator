#!/usr/bin/env node
/**
 * start-pipeline.js — Avvia automaticamente un workflow dell'orchestratore.
 * 
 * Uso:
 *   node start-pipeline.js                         # avvia full-pipeline
 *   node start-pipeline.js design-system-bootstrap # avvia solo SCSS
 *   node start-pipeline.js angular-component-gen   # avvia solo Angular
 *   node start-pipeline.js deploy-scss             # avvia solo deploy
 */

const http = require('http');

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const WORKFLOW_ID = process.argv[2] || 'html-to-angular-lib';
const POLL_MS = 5000;

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(msg, color = '') {
  const time = new Date().toLocaleTimeString('it-IT');
  console.log(`${COLORS.gray}[${time}]${COLORS.reset} ${color}${msg}${COLORS.reset}`);
}

async function apiGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`${API_BASE}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`Invalid JSON from ${path}`)); }
      });
    }).on('error', reject);
  });
}

async function apiPost(path, body = {}) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) },
    };
    const url = new URL(`${API_BASE}${path}`);
    const req = http.request({ ...options, hostname: url.hostname, port: url.port, path: url.pathname }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`Invalid JSON from POST ${path}`)); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}╔═══════════════════════════════════════════╗`);
  console.log(`║   Multi-Agent Orchestrator Pipeline     ║`);
  console.log(`╚═══════════════════════════════════════════╝${COLORS.reset}\n`);

  // Check API health
  log('Verifica API...', COLORS.gray);
  try {
    const health = await apiGet('/api/health');
    log(`API online: ${API_BASE}`, COLORS.green);
  } catch (e) {
    log(`API non raggiungibile: ${API_BASE}`, COLORS.red);
    log('Avvia l\'API con: npm run start:api', COLORS.yellow);
    process.exit(1);
  }

  // Check workflow exists
  log(`Carico workflow: ${WORKFLOW_ID}`, COLORS.gray);
  const wfList = await apiGet('/api/workflows');
  const wf = wfList.data?.find(w => w.id === WORKFLOW_ID);
  if (!wf) {
    log(`Workflow '${WORKFLOW_ID}' non trovato.`, COLORS.red);
    log(`Workflow disponibili: ${wfList.data?.map(w => w.id).join(', ')}`, COLORS.yellow);
    process.exit(1);
  }

  log(`Workflow: ${COLORS.bold}${wf.name}${COLORS.reset}`, COLORS.cyan);
  log(`Task: ${wf.tasks?.length || 0}`, COLORS.gray);
  log(`Obiettivo: ${wf.objective?.slice(0, 100)}...`, COLORS.gray);
  console.log('');

  // Start execution
  log(`Avvio esecuzione...`, COLORS.cyan);
  const startRes = await apiPost('/api/executions', { workflowId: WORKFLOW_ID });
  if (!startRes.data?.id) {
    log(`Errore avvio: ${JSON.stringify(startRes)}`, COLORS.red);
    process.exit(1);
  }

  const execId = startRes.data.id;
  log(`Esecuzione avviata: ${COLORS.bold}${execId}${COLORS.reset}`, COLORS.green);
  log(`Segui live su: http://localhost:60375/executions/${execId}`, COLORS.cyan);
  console.log('');

  // Poll until done
  let lastStatus = '';
  let lastCompleted = 0;
  const startTime = Date.now();

  while (true) {
    await sleep(POLL_MS);

    const exec = await apiGet(`/api/executions/${execId}`);
    const data = exec.data;

    if (!data) {
      log('Nessun dato esecuzione, riprovo...', COLORS.yellow);
      continue;
    }

    const completed = data.completedTasks || 0;
    const total = data.totalTasks || data.tasks?.length || 0;
    const failed = data.failedTasks || 0;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = mins > 0 ? `${mins}m${secs}s` : `${secs}s`;

    if (data.status !== lastStatus || completed !== lastCompleted) {
      lastStatus = data.status;
      lastCompleted = completed;

      const bar = '█'.repeat(completed) + '░'.repeat(Math.max(0, total - completed));
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Find running task
      const runningTask = data.tasks?.find(t => t.status === 'running');
      const taskInfo = runningTask ? ` ↳ ${runningTask.agentId}: ${(runningTask.title || runningTask.id).slice(0, 50)}` : '';

      log(`[${bar}] ${completed}/${total} (${pct}%) — ${timeStr}${taskInfo}`, COLORS.cyan);
    }

    if (data.status === 'completed') {
      console.log('');
      log(`Pipeline completata in ${timeStr}!`, COLORS.green);
      log(`Task completati: ${completed}/${total}`, COLORS.green);
      if (failed > 0) log(`Task con errori: ${failed} (continueOnError attivo)`, COLORS.yellow);
      log(`Output in: workspace/output/`, COLORS.cyan);
      process.exit(0);
    }

    if (data.status === 'failed') {
      console.log('');
      log(`Pipeline fallita dopo ${timeStr}.`, COLORS.red);
      const failedTasks = data.tasks?.filter(t => t.status === 'failed') || [];
      failedTasks.forEach(t => {
        log(`  ✗ ${t.id}: ${t.errors?.[0]?.message || t.errors?.[0] || 'errore sconosciuto'}`, COLORS.red);
      });
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error(`\nErrore fatale: ${err.message}`);
  process.exit(1);
});
