import { Router } from 'express';
import { getVentas, createVenta, deleteVenta } from '../controllers/ventas.js';

const router = Router();

router.get('/', getVentas);
router.post('/', createVenta);
router.delete('/:id', deleteVenta);

export default router;