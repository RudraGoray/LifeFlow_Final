const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');
const prisma = require('../config/db');

const ML_DIR = path.join(__dirname, '..', '..', 'ml');
// A challenger only replaces the champion if it isn't meaningfully worse.
const PROMOTION_TOLERANCE = 0.05; // 5% relative MAPE slack
const FORECAST_MONTHS = 12;

function runPython(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [path.join(ML_DIR, script), ...args], { cwd: path.join(__dirname, '..', '..') });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`${script} exited ${code}: ${stderr.slice(-2000)}`));
      }
      // Scripts print exactly one JSON line (last stdout line starting with '{').
      const lines = stdout.trim().split('\n').filter((l) => l.trim().startsWith('{'));
      if (lines.length === 0) {
        return reject(new Error(`${script} produced no JSON output. stderr: ${stderr.slice(-1000)}`));
      }
      try {
        resolve(JSON.parse(lines[lines.length - 1]));
      } catch (e) {
        reject(new Error(`${script} produced invalid JSON: ${e.message}`));
      }
    });
  });
}

async function getActiveModel() {
  return prisma.modelVersion.findFirst({
    where: { isActive: true },
    orderBy: { trainedAt: 'desc' },
  });
}

// Monthly cycle: retrain → compare → maybe promote → regenerate forecast.
async function runRetrainingCycle() {
  console.log('[forecast] monthly retraining cycle started');
  const result = await runPython('retrain.py', ['--holdout-months', '3']);
  if (result.error) throw new Error(`retrain failed: ${result.error}`);
  console.log(`[forecast] challenger v${result.model_version_id} MAPE=${result.mape} MAE=${result.mae}`);

  const active = await getActiveModel();

  const shouldPromote =
    !active || // first model ever: promote unconditionally
    result.mape <= active.mape * (1 + PROMOTION_TOLERANCE);

  if (!shouldPromote) {
    console.warn(
      `[forecast] challenger v${result.model_version_id} (MAPE=${result.mape}) is meaningfully worse ` +
      `than active v${active.id} (MAPE=${active.mape}); keeping v${active.id} active.`
    );
    return { promoted: false, challenger: result, active };
  }

  await prisma.$transaction([
    prisma.modelVersion.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.modelVersion.update({ where: { id: result.model_version_id }, data: { isActive: true } }),
  ]);
  console.log(`[forecast] promoted v${result.model_version_id} to active`);

  const forecast = await runPython('forecast.py', ['--months', String(FORECAST_MONTHS)]);
  if (forecast.error) throw new Error(`forecast generation failed: ${forecast.error}`);
  console.log(`[forecast] regenerated ${forecast.rows} forecast rows (model v${forecast.model_version_id})`);

  return { promoted: true, challenger: result, active, forecast };
}

function scheduleForecastJobs() {
  // 03:00 on the 1st of every month.
  cron.schedule('0 3 1 * *', () => {
    runRetrainingCycle().catch((e) => console.error('[forecast] cycle failed:', e.message));
  });
  console.log('[forecast] monthly retraining scheduled (0 3 1 * *)');
}

module.exports = { scheduleForecastJobs, runRetrainingCycle, PROMOTION_TOLERANCE, FORECAST_MONTHS };
