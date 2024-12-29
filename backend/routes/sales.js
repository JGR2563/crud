const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las ventas
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.*, c.name as customer_name 
            FROM sales s 
            LEFT JOIN customers c ON s.customer_id = c.id 
            ORDER BY s.date DESC
        `);
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ error: 'Error al obtener las ventas' });
    }
});

// Obtener una venta específica con sus detalles
router.get('/:id', async (req, res) => {
    try {
        // Obtener la venta
        const saleResult = await db.query(`
            SELECT s.*, c.name as customer_name 
            FROM sales s 
            LEFT JOIN customers c ON s.customer_id = c.id 
            WHERE s.id = $1
        `, [req.params.id]);
        
        if (saleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        const sale = saleResult.rows[0];
        
        // Obtener los detalles de la venta
        const detailsResult = await db.query(`
            SELECT 
                sd.*,
                p.name as product_name,
                p.price
            FROM sale_details sd
            LEFT JOIN products p ON sd.product_id = p.id
            WHERE sd.sale_id = $1
        `, [req.params.id]);
        
        sale.details = detailsResult.rows;
        
        res.json({ data: sale });
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ error: 'Error al obtener la venta' });
    }
});

// Crear una nueva venta
router.post('/', async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const { customer_id, products, total, date, status } = req.body;
        
        // Insertar la venta
        const saleResult = await client.query(
            'INSERT INTO sales (customer_id, total, date, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [customer_id, total, date, status]
        );
        
        const saleId = saleResult.rows[0].id;
        
        // Insertar los detalles de la venta
        for (const product of products) {
            await client.query(
                'INSERT INTO sale_details (sale_id, product_id, quantity) VALUES ($1, $2, $3)',
                [saleId, product.product_id, product.quantity]
            );
            
            // Actualizar el stock del producto
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [product.quantity, product.product_id]
            );
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Venta creada exitosamente', data: { id: saleId } });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear venta:', error);
        res.status(500).json({ error: 'Error al crear la venta' });
    } finally {
        client.release();
    }
});

// Eliminar una venta
router.delete('/:id', async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // Obtener los detalles de la venta
        const detailsResult = await client.query(
            'SELECT * FROM sale_details WHERE sale_id = $1',
            [req.params.id]
        );
        
        // Restaurar el stock de los productos
        for (const detail of detailsResult.rows) {
            await client.query(
                'UPDATE products SET stock = stock + $1 WHERE id = $2',
                [detail.quantity, detail.product_id]
            );
        }
        
        // Eliminar los detalles de la venta
        await client.query('DELETE FROM sale_details WHERE sale_id = $1', [req.params.id]);
        
        // Eliminar la venta
        const result = await client.query('DELETE FROM sales WHERE id = $1', [req.params.id]);
        
        if (result.rowCount === 0) {
            throw new Error('Venta no encontrada');
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Venta eliminada exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ error: 'Error al eliminar la venta' });
    } finally {
        client.release();
    }
});

module.exports = router;
