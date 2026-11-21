// Simulasi minimum Google Apps Script untuk menjalankan Code.gs dalam Node (data dalam memori, tiada Google sebenar)
// Guna: const G = require('./gasmock.js')('/laluan/Code.gs'); G.panggil({action:'ping'}); G.baris('AHLI')
const vm = require('vm'), crypto = require('crypto'), fs = require('fs');
function buat(kodPath) {
  const sheets = {};
  function Sheet(nama) { this.nama = nama; this.d = []; }
  Sheet.prototype = {
    getLastRow() { let n = this.d.length; while (n && this.d[n - 1].every(v => v === '' || v == null)) n--; return n; },
    getLastColumn() { return this.d.reduce((m, r) => { let n = r.length; while (n && (r[n - 1] === '' || r[n - 1] == null)) n--; return Math.max(m, n); }, 0); },
    getMaxRows() { return Math.max(1000, this.d.length); }, getMaxColumns() { return 50; },
    setFrozenRows() {}, deleteRow(r) { this.d.splice(r - 1, 1); }, getName() { return this.nama; },
    getDataRange() { return this.getRange(1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); },
    getRange(r, c, nr, nc) { const sh = this; nr = nr || 1; nc = nc || 1;
      const sel = () => { const o = []; for (let i = 0; i < nr; i++) { const row = []; for (let j = 0; j < nc; j++) { const v = (sh.d[r - 1 + i] || [])[c - 1 + j]; row.push(v == null ? '' : v); } o.push(row); } return o; };
      return { getValues: sel, getDisplayValues: () => sel().map(x => x.map(String)),
        setValues(v) { for (let i = 0; i < v.length; i++) { while (sh.d.length < r + i) sh.d.push([]); for (let j = 0; j < v[i].length; j++) sh.d[r - 1 + i][c - 1 + j] = v[i][j]; } return this; },
        setValue(v) { return this.setValues([[v]]); }, setNumberFormat() { return this; }, setFontWeight() { return this; },
        setBackground() { return this; }, setFontColor() { return this; } }; }
  };
  const ss = { getId: () => 'mock', getSheetByName: n => sheets[n] || null, insertSheet: n => (sheets[n] = new Sheet(n)), getSheets: () => Object.values(sheets), deleteSheet() {} };
  const cache = {}, props = {}, logs = [];
  const ctx = {
    console,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, flush() {}, openById() { throw new Error('tiada'); } },
    Utilities: { getUuid: () => crypto.randomUUID(), DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (a, s) => [...crypto.createHash('sha256').update(Array.isArray(s) ? Buffer.from(s.map(b => b & 255)) : s, 'utf8').digest()].map(b => b > 127 ? b - 256 : b),
      formatDate: (d, tz, f) => { const p = n => String(n).padStart(2, '0'); return f.replace('yyyy', d.getFullYear()).replace('MM', p(d.getMonth() + 1)).replace('dd', p(d.getDate())).replace('HH', p(d.getHours())).replace('mm', p(d.getMinutes())).replace('ss', p(d.getSeconds())); } },
    CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = String(v); }, remove: k => { delete cache[k]; } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
    ContentService: { createTextOutput: t => ({ t, setMimeType() { return this; } }), MimeType: { JSON: 'json' } },
    Logger: { log: m => logs.push(m) },
    ScriptApp: { getProjectTriggers: () => [], deleteTrigger() {}, newTrigger: () => { const b = { timeBased: () => b, everyMinutes: () => b, onWeekDay: () => b, atHour: () => b, create: () => ({}) }; return b; }, WeekDay: { SUNDAY: 'SUNDAY' } },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(kodPath, 'utf8') + '\nthis.urus_ = urus_; this.doGet = doGet; this.doPost = doPost;', ctx);
  return { ctx, sheets, logs,
    panggil: p => { vm.runInContext('_tbl = {}', ctx); return JSON.parse(JSON.stringify(ctx.urus_(p))); },
    baris: n => { const sh = sheets[n]; if (!sh || !sh.d.length) return []; const h = sh.d[0]; return sh.d.slice(1).map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? '']))); } };
}
module.exports = buat;
