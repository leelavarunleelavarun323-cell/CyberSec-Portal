/* ═══════════════════════════════════════════════════════════════
   routes/articles.js — RESTful API for Tutorial Articles
   GET  /api/articles          — Fetch all (with optional filters)
   GET  /api/articles/:id      — Fetch single article
   POST /api/articles          — Create new article (admin)
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const { validateBody } = require('../middleware/validate');
const { saveDatabase } = require('../database');

/**
 * Helper: Convert sql.js result to array of objects.
 * sql.js returns { columns: [...], values: [[...], ...] }
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
 * Create the articles router.
 * @param {import('sql.js').Database} db
 */
function createArticlesRouter(db) {
  const router = express.Router();

  /* ─── GET /api/articles ────────────────────────────────────── */
  router.get('/', (req, res) => {
    try {
      const { category } = req.query;
      let result;

      if (category) {
        // Parameterized query — prevents SQL injection
        const stmt = db.prepare('SELECT * FROM articles WHERE category = $cat ORDER BY created_at DESC');
        stmt.bind({ $cat: category });
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        result = rows;
      } else {
        const raw = db.exec('SELECT * FROM articles ORDER BY created_at DESC');
        result = resultToObjects(raw);
      }

      res.json({
        success: true,
        count: result.length,
        data: result,
      });
    } catch (err) {
      console.error('[Articles] GET error:', err.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /* ─── GET /api/articles/:id ────────────────────────────────── */
  router.get('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid article ID' });
      }

      // Parameterized query — prevents SQL injection
      const stmt = db.prepare('SELECT * FROM articles WHERE id = $id');
      stmt.bind({ $id: id });

      let article = null;
      if (stmt.step()) {
        article = stmt.getAsObject();
      }
      stmt.free();

      if (!article) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      res.json({ success: true, data: article });
    } catch (err) {
      console.error('[Articles] GET/:id error:', err.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /* ─── POST /api/articles ───────────────────────────────────── */
  router.post(
    '/',
    validateBody(['title', 'content'], { maxLength: 50000 }),
    (req, res) => {
      try {
        const { title, content, category = 'general' } = req.body;

        // Whitelist allowed categories
        const allowedCategories = [
          'general', 'networking', 'exploitation',
          'forensics', 'web-security', 'cryptography',
        ];
        const safeCategory = allowedCategories.includes(category) ? category : 'general';

        // Parameterized INSERT — prevents SQL injection
        db.run(
          'INSERT INTO articles (title, content, category) VALUES ($title, $content, $category)',
          { $title: title, $content: content, $category: safeCategory }
        );

        // Persist to disk
        saveDatabase();

        // Retrieve the newly created article
        const stmt = db.prepare('SELECT * FROM articles WHERE rowid = last_insert_rowid()');
        let newArticle = null;
        if (stmt.step()) {
          newArticle = stmt.getAsObject();
        }
        stmt.free();

        res.status(201).json({
          success: true,
          message: 'Article created successfully',
          data: newArticle,
        });
      } catch (err) {
        console.error('[Articles] POST error:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  );

  return router;
}

module.exports = createArticlesRouter;
