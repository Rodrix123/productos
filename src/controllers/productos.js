import supabase from '../config/supabase.js';

export async function getProductos(req, res) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function createProducto(req, res) {
  const { nombre, categoria, precio, stock } = req.body;
  if (!nombre || precio == null) {
    return res.status(400).json({ error: 'nombre y precio son obligatorios' });
  }
  const { data, error } = await supabase
    .from('productos')
    .insert([{ nombre, categoria: categoria || 'General', precio, stock: stock || 0 }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

export async function updateProducto(req, res) {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;
  const { data, error } = await supabase
    .from('productos')
    .update({ nombre, categoria, precio, stock })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function deleteProducto(req, res) {
  const { id } = req.params;
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Producto eliminado' });
}

export async function getStats(req, res) {
  const { data: productos, error } = await supabase
    .from('productos')
    .select('nombre, precio, stock');
  if (error) return res.status(500).json({ error: error.message });

  const count = productos.length;
  const totalValor = productos.reduce((acc, p) => acc + p.precio * p.stock, 0);
  const maxProducto = productos.reduce(
    (max, p) => (p.precio > (max?.precio || 0) ? p : max),
    null
  );

  res.json({
    count,
    totalValor,
    maxNombre: maxProducto?.nombre || '—',
    maxPrecio: maxProducto?.precio || 0,
  });
}