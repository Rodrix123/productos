import "dotenv/config"
import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"


const app = express()
const PORT =  

const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db  = new Database('fruver_inventario.db');

app.use(express.json());
app.use(express.static(__dirname)); // sirve index.html, index.js, etc.

// ── GET productos ──
app.get('/api/productos', (req, res) => {
  const rows = db.prepare(`
    SELECT id, nombre, categoria, precio, stock, (precio * stock) as valor_total
    FROM productos ORDER BY id
  `).all();
  res.json(rows);
});

// ── GET stats ──
app.get('/api/stats', (req, res) => {
  const maxProd  = db.prepare('SELECT nombre, MAX(precio) as precio FROM productos').get();
  const count    = db.prepare('SELECT COUNT(*) as total FROM productos').get();
  const total    = db.prepare('SELECT SUM(precio * stock) as valor FROM productos').get();
  res.json({
    max_nombre:  maxProd?.nombre  || '',
    max_precio:  maxProd?.precio  || 0,
    count:       count.total,
    valor_total: total.valor || 0
  });
});

// ── POST agregar producto ──
app.post('/api/productos', (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  db.prepare(
    'INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)'
  ).run(nombre, categoria || 'General', precio, stock);
  res.json({ ok: true });
});

// ── DELETE eliminar producto ──
app.delete('/api/productos/:id', (req, res) => {
  db.prepare('DELETE FROM productos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── POST vender 1 kg ──
app.post('/api/vender/:id', (req, res) => {
  const id  = req.params.id;
  const row = db.prepare('SELECT stock FROM productos WHERE id = ?').get(id);
  if (!row || row.stock < 1) {
    return res.json({ ok: false, error: 'Sin stock suficiente' });
  }
  const hoy = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE productos SET stock = stock - 1 WHERE id = ?').run(id);
  db.prepare('INSERT INTO ventas (id_producto, fecha, total_kg) VALUES (?, ?, 1)').run(id, hoy);
  res.json({ ok: true });
});

// ── INICIAR SERVIDOR ──
app.listen(3000, () => {
  console.log('Run in http://localhost:3000');
});
