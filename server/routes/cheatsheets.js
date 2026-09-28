/* ═══════════════════════════════════════════════════════════════
   routes/cheatsheets.js — RESTful API for Cheat Sheets
   GET  /api/cheatsheets       — Fetch all cheat sheets
   GET  /api/cheatsheets/:id   — Fetch & increment download count
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const { saveDatabase } = require('../database');

/**
 * Helper: Convert sql.js result to array of objects.
 */
function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

/**
 * Create the cheat-sheets router.
 * @param {import('sql.js').Database} db
 */
function createCheatsheetsRouter(db) {
  const router = express.Router();

  /* ─── GET /api/cheatsheets ─────────────────────────────────── */
  router.get('/', (req, res) => {
    try {
      const raw = db.exec('SELECT * FROM cheat_sheets ORDER BY title ASC');
      const sheets = resultToObjects(raw);

      res.json({
        success: true,
        count: sheets.length,
        data: sheets,
      });
    } catch (err) {
      console.error('[Cheatsheets] GET error:', err.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /* ─── GET /api/cheatsheets/:id ─────────────────────────────── *
   *  Returns the cheat sheet and increments its download counter. */
  router.get('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid cheat sheet ID' });
      }

      // Fetch the cheat sheet — parameterized query
      const stmt = db.prepare('SELECT * FROM cheat_sheets WHERE id = $id');
      stmt.bind({ $id: id });

      let sheet = null;
      if (stmt.step()) {
        sheet = stmt.getAsObject();
      }
      stmt.free();

      if (!sheet) {
        return res.status(404).json({ success: false, error: 'Cheat sheet not found' });
      }

      // Increment download count — parameterized query
      db.run(
        'UPDATE cheat_sheets SET downloads_count = downloads_count + 1 WHERE id = $id',
        { $id: id }
      );
      saveDatabase();

      res.json({
        success: true,
        data: { ...sheet, downloads_count: sheet.downloads_count + 1 },
      });
    } catch (err) {
      console.error('[Cheatsheets] GET/:id error:', err.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createCheatsheetsRouter;
