import supabase from '../config/supabase.js';

export async function getVentas(req, res) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*, productos(nombre, categoria)')
    .order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function createVenta(req, res) {
  const { id_producto, total_kg } = req.body;
  if (!id_producto || !total_kg) {
    return res.status(400).json({ error: 'id_producto y total_kg son obligatorios' });
  }

  const { data: producto, error: errProd } = await supabase
    .from('productos')
    .select('nombre, stock')
    .eq('id', id_producto)
    .single();

  if (errProd || !producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  if (producto.stock < total_kg) {
    return res.status(400).json({ error: `Stock insuficiente. Disponible: ${producto.stock} kg` });
  }

  const fecha = new Date().toISOString().split('T')[0];

  const { data: venta, error: errVenta } = await supabase
    .from('ventas')
    .insert([{ id_producto, fecha, total_kg }])
    .select()
    .single();

  if (errVenta) return res.status(500).json({ error: errVenta.message });

  const { error: errStock } = await supabase
    .from('productos')
    .update({ stock: producto.stock - total_kg })
    .eq('id', id_producto);

  if (errStock) return res.status(500).json({ error: errStock.message });

  res.status(201).json({ venta, nuevoStock: producto.stock - total_kg });
}

export async function deleteVenta(req, res) {
  const { id } = req.params;
  const { error } = await supabase
    .from('ventas')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Venta eliminada' });
}