import { Router } from 'express';
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getStats,
} from '../controllers/productos.js';

const router = Router();

router.get('/', getProductos);
router.get('/stats', getStats);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;