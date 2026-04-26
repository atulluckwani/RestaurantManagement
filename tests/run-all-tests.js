const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function formatTimestamp(date) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

// ── Date-stamped screenshot folder ───────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10); // e.g. 2026-04-25
const runTimestamp = formatTimestamp(new Date());
const screenshotDir = path.join(__dirname, '..', 'Screenshots', today);
fs.mkdirSync(screenshotDir, { recursive: true });

// ── Auto-discover test definitions from the tests folder ─────────────────────
const TESTS = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith('.js') && f !== 'run-all-tests.js')
  .sort()
  .map((f) => ({ name: f.replace(/\.js$/, ''), file: f }));

// ── Run a single test file as a child process ─────────────────────────────────
function runTest(testDef) {
  return new Promise((resolve) => {
    const startTime = new Date();
    let stdout = '';
    let stderr = '';

    // Snapshot existing PNGs before the test runs so we can detect new ones after.
    const pngsBefore = new Set(
      fs.readdirSync(screenshotDir).filter((f) => f.endsWith('.png'))
    );

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`▶  Running: ${testDef.name}`);
    console.log(`   Start  : ${startTime.toISOString()}`);
    console.log(`${'─'.repeat(60)}`);

    const proc = spawn('node', [path.join(__dirname, testDef.file)], {
      env: {
        ...process.env,
        SCREENSHOT_DIR: screenshotDir,
        SCREENSHOT_TIMESTAMP: runTimestamp,
      },
      cwd: path.join(__dirname, '..'),
    });

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    proc.on('close', (code) => {
      const endTime = new Date();
      const passed = code === 0;

      // Detect any new PNGs created during this test run.
      const screenshots = fs
        .readdirSync(screenshotDir)
        .filter((f) => f.endsWith('.png') && !pngsBefore.has(f));

      console.log(`\n${passed ? '✔  PASS' : '✖  FAIL'}: ${testDef.name}`);
      console.log(`   End    : ${endTime.toISOString()}`);
      console.log(`   Duration: ${((endTime - startTime) / 1000).toFixed(2)}s`);
      resolve({ ...testDef, startTime, endTime, stdout, stderr, passed, screenshots });
    });
  });
}

// ── Read all detected screenshots as base64 img tags ────────────────────────
function screenshotImgTags(screenshots) {
  if (!screenshots || screenshots.length === 0) {
    return '<em style="color:#999;">No screenshot captured</em>';
  }
  return screenshots
    .map((filename) => {
      const fullPath = path.join(screenshotDir, filename);
      if (!fs.existsSync(fullPath)) return '';
      const data = fs.readFileSync(fullPath).toString('base64');
      const uri = `data:image/png;base64,${data}`;
      return `<div style="margin-bottom:8px;"><div style="font-size:11px;color:#666;margin-bottom:4px;">${filename}</div><img src="${uri}" style="max-width:100%;border:1px solid #ccc;border-radius:4px;" /></div>`;
    })
    .join('');
}

// ── Generate self-contained HTML report ───────────────────────────────────────
function generateReport(results) {
  const reportPath = path.join(screenshotDir, `TestExecutionReport_${runTimestamp}.html`);
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.length - totalPassed;

  const rowBg = (passed) => (passed ? '#d4edda' : '#f8d7da');
  const badge = (passed) =>
    passed
      ? '<span style="background:#28a745;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold;">PASS</span>'
      : '<span style="background:#dc3545;color:#fff;padding:3px 10px;border-radius:12px;font-weight:bold;">FAIL</span>';

  const tcRows = results
    .map((r) => {
      const imgHtml = screenshotImgTags(r.screenshots);

      const log = (r.stdout + (r.stderr ? '\n[STDERR]\n' + r.stderr : ''))
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const duration = ((r.endTime - r.startTime) / 1000).toFixed(2);

      return `
      <tr style="background:${rowBg(r.passed)};">
        <td style="padding:10px;font-weight:bold;">${r.name}</td>
        <td style="padding:10px;text-align:center;">${badge(r.passed)}</td>
        <td style="padding:10px;font-family:monospace;font-size:12px;">${r.startTime.toISOString()}</td>
        <td style="padding:10px;font-family:monospace;font-size:12px;">${r.endTime.toISOString()}</td>
        <td style="padding:10px;text-align:center;">${duration}s</td>
      </tr>
      <tr>
        <td colspan="5" style="padding:12px 16px;background:#f9f9f9;border-bottom:2px solid #dee2e6;">
          <details>
            <summary style="cursor:pointer;font-weight:bold;">Console output</summary>
            <pre style="margin:8px 0 0;padding:10px;background:#1e1e1e;color:#d4d4d4;border-radius:4px;overflow:auto;font-size:12px;">${log || '(no output)'}</pre>
          </details>
          <div style="margin-top:10px;">
            <strong>Screenshot:</strong><br/>
            ${imgHtml}
          </div>
        </td>
      </tr>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Test Report – ${today}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f6f9; color: #333; }
    .header { background: #343a40; color: #fff; padding: 20px 30px; }
    .header h1 { margin: 0 0 4px; font-size: 22px; }
    .header p  { margin: 0; font-size: 13px; opacity: .8; }
    .summary { display: flex; gap: 20px; padding: 20px 30px; }
    .summary-box { flex: 1; padding: 16px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; }
    .summary-box.total  { background: #e2e6ea; }
    .summary-box.pass   { background: #d4edda; color: #155724; }
    .summary-box.fail   { background: #f8d7da; color: #721c24; }
    .summary-box small  { display: block; font-size: 12px; font-weight: normal; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 0 0 30px; }
    th { background: #343a40; color: #fff; padding: 10px 12px; text-align: left; font-size: 13px; }
    td { border-bottom: 1px solid #dee2e6; vertical-align: top; }
    .container { padding: 0 30px 30px; }
    details summary { font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Playwright UI Test Report</h1>
    <p>Run date: ${new Date().toISOString()} &nbsp;|&nbsp; Screenshot folder: Screenshots/${today}</p>
  </div>

  <div class="summary">
    <div class="summary-box total">${results.length}<small>Total</small></div>
    <div class="summary-box pass">${totalPassed}<small>Passed</small></div>
    <div class="summary-box fail">${totalFailed}<small>Failed</small></div>
  </div>

  <div class="container">
    <table>
      <thead>
        <tr>
          <th>Test Case</th>
          <th style="text-align:center;">Result</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th style="text-align:center;">Duration</th>
        </tr>
      </thead>
      <tbody>
        ${tcRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  fs.writeFileSync(reportPath, html, 'utf8');
  console.log(`\n✅  HTML report saved: ${reportPath}`);
  return reportPath;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Screenshot folder : ${screenshotDir}`);
  console.log(`Tests to run      : ${TESTS.length}`);

  const results = [];
  for (const test of TESTS) {
    const result = await runTest(test);
    results.push(result);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUITE COMPLETE  Passed: ${results.filter((r) => r.passed).length}/${results.length}`);
  console.log(`${'═'.repeat(60)}`);

  generateReport(results);
})();
