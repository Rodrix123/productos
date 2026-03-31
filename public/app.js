const API = '/api';
let selectedId = null;

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

async function cargarDatos() {
  const tbody = document.getElementById('tabla-body');
  const productos = await fetchJSON(`${API}/productos`);

  tbody.innerHTML = '';

  if (!productos.length) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty-state"><div class="icon">🌱</div>No hay productos. ¡Agrega el primero!</div>
    </td></tr>`;
    return;
  }

  productos.forEach(p => {
    const valorTotal = p.precio * p.stock;
    const badgeClass = categoriaBadge(p.categoria);
    const stockClass = p.stock <= 5 ? 'stock-low' : 'stock-ok';
    const tr = document.createElement('tr');
    if (p.id === selectedId) tr.classList.add('selected');
    tr.innerHTML = `
      <td style="color:var(--muted);font-size:12px">#${p.id}</td>
      <td><strong>${p.nombre}</strong></td>
      <td class="cat-badge"><span class="badge ${badgeClass}">${p.categoria || 'General'}</span></td>
      <td>$${Number(p.precio).toLocaleString('es-CO')}</td>
      <td class="${stockClass}">${Number(p.stock).toFixed(1)} kg</td>
      <td style="color:var(--green)">$${Number(valorTotal).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
    `;
    tr.onclick = () => seleccionarFila(tr, p.id);
    tbody.appendChild(tr);
  });
}

function categoriaBadge(cat) {
  if (!cat) return 'badge-other';
  const c = cat.toLowerCase();
  if (c.includes('fruta')) return 'badge-fruit';
  if (c.includes('verdura')) return 'badge-veg';
  if (c.includes('tubérculo') || c.includes('tuberculo')) return 'badge-tub';
  return 'badge-other';
}

function seleccionarFila(tr, id) {
  document.querySelectorAll('#tabla-body tr').forEach(r => r.classList.remove('selected'));
  tr.classList.add('selected');
  selectedId = id;
}

async function actualizarStats() {
  const stats = await fetchJSON(`${API}/productos/stats`);
  document.getElementById('stat-max-name').textContent = stats.maxNombre;
  document.getElementById('stat-max-price').textContent = `$${Number(stats.maxPrecio).toLocaleString('es-CO')} /kg`;
  document.getElementById('stat-count').textContent = stats.count;
  document.getElementById('stat-total').textContent = `$${Number(stats.totalValor).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

function refrescarTodo() {
  cargarDatos();
  actualizarStats();
}

async function agregarProducto() {
  const nombre = document.getElementById('inp-nombre').value.trim();
  const categoria = document.getElementById('inp-cat').value.trim();
  const precio = parseFloat(document.getElementById('inp-precio').value);
  const stock = parseFloat(document.getElementById('inp-stock').value);

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    toast('Completa todos los campos obligatorios', true);
    return;
  }

  const res = await fetchJSON(`${API}/productos`, {
    method: 'POST',
    body: JSON.stringify({ nombre, categoria: categoria || 'General', precio, stock }),
  });

  if (res.error) { toast('✗ ' + res.error, true); return; }
  limpiarCampos();
  refrescarTodo();
  toast(`✓ "${res.nombre}" agregado al inventario`);
}

async function venderKg() {
  if (!selectedId) { toast('Selecciona un producto de la lista', true); return; }
  const total_kg = parseInt(document.getElementById('inp-kg').value) || 1;

  const res = await fetchJSON(`${API}/ventas`, {
    method: 'POST',
    body: JSON.stringify({ id_producto: selectedId, total_kg }),
  });

  if (res.error) { toast('✗ ' + res.error, true); return; }
  refrescarTodo();
  toast(`✓ ${total_kg} kg vendido(s). Stock restante: ${res.nuevoStock} kg`);
}

async function eliminarProducto() {
  if (!selectedId) { toast('Selecciona un producto de la lista', true); return; }
  if (!confirm('¿Eliminar este producto del inventario?')) return;

  const res = await fetchJSON(`${API}/productos/${selectedId}`, { method: 'DELETE' });
  if (res.error) { toast('✗ ' + res.error, true); return; }

  selectedId = null;
  refrescarTodo();
  toast('✓ Producto eliminado');
}

function limpiarCampos() {
  ['inp-nombre', 'inp-cat', 'inp-precio', 'inp-stock', 'inp-kg'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('inp-kg').value = '1';
}

let toastTimer = null;
function toast(msg, error = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show' + (error ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = ''), 3000);
}

document.querySelectorAll('.field input').forEach(inp => {
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') agregarProducto();
  });
});

refrescarTodo();