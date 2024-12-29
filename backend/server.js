const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Configuración de la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'db',
    database: process.env.DB_NAME,
    port: 5432
});

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        // Crear tabla de productos si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                category VARCHAR(50),
                supplier_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de clientes si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                address TEXT,
                preferred BOOLEAN DEFAULT false,
                credit_limit DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de proveedores si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                address TEXT,
                active BOOLEAN DEFAULT true,
                credit_limit DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de ventas si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id),
                total DECIMAL(10,2) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'Completada',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de detalles de venta si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sale_details (
                id SERIAL PRIMARY KEY,
                sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insertar datos de ejemplo solo si no existen registros
        const productsCount = await pool.query('SELECT COUNT(*) FROM products');
        if (productsCount.rows[0].count === '0') {
            await pool.query(`
                INSERT INTO products (name, description, price, stock, category) VALUES
                ('Manzanas', 'Manzanas rojas frescas', 2.50, 100, 'Frutas'),
                ('Bananas', 'Bananas amarillas', 1.80, 150, 'Frutas'),
                ('Zanahorias', 'Zanahorias orgánicas', 1.20, 80, 'Verduras'),
                ('Papas', 'Papas blancas', 0.90, 200, 'Verduras'),
                ('Tomates', 'Tomates redondos', 1.50, 120, 'Verduras'),
                ('Lechuga', 'Lechuga criolla', 1.00, 50, 'Verduras'),
                ('Naranjas', 'Naranjas de jugo', 2.00, 100, 'Frutas'),
                ('Cebollas', 'Cebollas blancas', 1.30, 150, 'Verduras'),
                ('Peras', 'Peras verdes', 2.20, 80, 'Frutas'),
                ('Morrones', 'Morrones rojos', 2.80, 60, 'Verduras')
            `);
        }

        const customersCount = await pool.query('SELECT COUNT(*) FROM customers');
        if (customersCount.rows[0].count === '0') {
            await pool.query(`
                INSERT INTO customers (name, email, phone, address, preferred, credit_limit) VALUES
                ('Juan Pérez', 'juan@email.com', '11-1234-5678', 'Av. Siempreviva 123', true, 100000.00),
                ('María García', 'maria@email.com', '11-2345-6789', 'Calle Falsa 123', false, 50000.00),
                ('Carlos López', 'carlos@email.com', '11-3456-7890', 'Av. Rivadavia 1234', true, 150000.00),
                ('Ana Martínez', 'ana@email.com', '11-4567-8901', 'Corrientes 4321', false, 75000.00),
                ('Pedro Rodríguez', 'pedro@email.com', '11-5678-9012', 'Florida 999', true, 200000.00)
            `);
        }

        const suppliersCount = await pool.query('SELECT COUNT(*) FROM suppliers');
        if (suppliersCount.rows[0].count === '0') {
            await pool.query(`
                INSERT INTO suppliers (name, email, phone, address, active, credit_limit) VALUES
                ('Distribuidora Fresh', 'ventas@fresh.com', '11-1111-2222', 'Mercado Central, Puesto 123', true, 500000.00),
                ('Verdulería Mayor', 'compras@mayor.com', '11-3333-4444', 'Av. Mayorista 456, CABA', true, 350000.00),
                ('Rotisería El Horno', 'pedidos@elhorno.com', '11-5555-6666', 'Av. Comidas 123, CABA', false, 28000.00),
                ('Comedor Universitario', 'comedor@universidad.edu', '11-7777-8888', 'Campus Universitario, CABA', true, 250000.00),
                ('Cafetería El Momento', 'cafe@elmomento.com', '11-9999-0000', 'Calle Café 456, CABA', false, 15000.00),
                ('Restaurant Gourmet', 'chef@gourmet.com', '11-2222-4444', 'Av. Gourmet 789, CABA', true, 320000.00),
                ('Almacén de Barrio', 'almacen@barrio.com', '11-5555-7777', 'Calle Almacén 012, CABA', false, 12000.00),
                ('Escuela San Martín', 'cocina@sanmartin.edu', '11-8888-0000', 'Av. Educación 345, CABA', true, 180000.00),
                ('Club Deportivo', 'buffet@club.com', '11-1111-3333', 'Calle Deporte 678, CABA', false, 45000.00),
                ('Hospital Central', 'cocina@hospital.com', '11-4444-6666', 'Av. Salud 901, CABA', true, 280000.00),
                ('Empresa Catering', 'ventas@catering.com', '11-7777-9999', 'Calle Eventos 234, CABA', true, 420000.00)
            `);
        }

        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
}

// Inicializar la base de datos al arrancar
initializeDatabase();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
app.use(cors({
    origin: ['http://localhost', 'http://localhost:80'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Rutas CRUD para clientes
app.get('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, preferred } = req.body;
        
        const result = await pool.query(
            'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, preferred = $5 WHERE id = $6 RETURNING *',
            [name, email, phone, address, preferred, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas CRUD para proveedores
app.get('/suppliers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/suppliers', async (req, res) => {
    try {
        const { name, email, phone, address, active } = req.body;
        const result = await pool.query(
            'INSERT INTO suppliers (name, email, phone, address, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, phone, address, active]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, active } = req.body;
        
        const result = await pool.query(
            'UPDATE suppliers SET name = $1, email = $2, phone = $3, address = $4, active = $5 WHERE id = $6 RETURNING *',
            [name, email, phone, address, active, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas CRUD para ventas
app.get('/sales', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, c.name as customer_name 
            FROM sales s 
            LEFT JOIN customers c ON s.customer_id = c.id 
            ORDER BY s.date DESC
        `);
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener información de la venta
        const saleResult = await pool.query(`
            SELECT s.*, c.name as customer_name 
            FROM sales s 
            LEFT JOIN customers c ON s.customer_id = c.id 
            WHERE s.id = $1
        `, [id]);
        
        if (saleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        // Obtener detalles de la venta
        const detailsResult = await pool.query(`
            SELECT sd.*, p.name as product_name 
            FROM sale_details sd 
            LEFT JOIN products p ON sd.product_id = p.id 
            WHERE sd.sale_id = $1
        `, [id]);
        
        const sale = saleResult.rows[0];
        sale.details = detailsResult.rows;
        
        res.json({ data: sale });
    } catch (error) {
        console.error('Error al obtener detalles de venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/sales', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { customer_id, products, total } = req.body;
        
        // Crear la venta
        const saleResult = await client.query(
            'INSERT INTO sales (customer_id, total, date) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
            [customer_id, total]
        );
        
        const sale = saleResult.rows[0];
        
        // Insertar los detalles de la venta y actualizar el stock
        for (const product of products) {
            // Verificar stock disponible
            const stockResult = await client.query(
                'SELECT stock FROM products WHERE id = $1',
                [product.id]
            );
            
            if (stockResult.rows.length === 0) {
                throw new Error(`Producto ${product.id} no encontrado`);
            }
            
            const currentStock = stockResult.rows[0].stock;
            if (currentStock < product.quantity) {
                throw new Error(`Stock insuficiente para el producto ${product.id}`);
            }
            
            // Insertar detalle de venta
            await client.query(
                'INSERT INTO sale_details (sale_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [sale.id, product.id, product.quantity, product.price]
            );
            
            // Actualizar stock
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [product.quantity, product.id]
            );
        }
        
        await client.query('COMMIT');
        
        // Obtener los detalles completos de la venta
        const fullSaleResult = await client.query(`
            SELECT s.*, c.name as customer_name 
            FROM sales s 
            LEFT JOIN customers c ON s.customer_id = c.id 
            WHERE s.id = $1
        `, [sale.id]);
        
        const detailsResult = await client.query(`
            SELECT sd.*, p.name as product_name 
            FROM sale_details sd 
            LEFT JOIN products p ON sd.product_id = p.id 
            WHERE sd.sale_id = $1
        `, [sale.id]);
        
        const fullSale = fullSaleResult.rows[0];
        fullSale.details = detailsResult.rows;
        
        res.status(201).json({ data: fullSale });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear venta:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// Rutas CRUD para productos
app.get('/products', async (req, res) => {
    try {
        const search = req.query.search || '';
        const category = req.query.category || '';
        
        let query = `
            SELECT p.*, s.name as supplier_name 
            FROM products p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id 
            WHERE (LOWER(p.name) LIKE LOWER($1) OR LOWER(p.description) LIKE LOWER($1))
        `;
        const params = [`%${search}%`];
        
        if (category) {
            query += ` AND p.category = $2`;
            params.push(category);
        }
        
        query += ` ORDER BY p.name`;
        
        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

app.post('/products', async (req, res) => {
    try {
        const { name, description, price, stock, category, supplier_id } = req.body;
        const result = await pool.query(
            'INSERT INTO products (name, description, price, stock, category, supplier_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, stock, category, supplier_id]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { name, description, price, stock, category, supplier_id } = req.body;
        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, supplier_id = $6 WHERE id = $7 RETURNING *',
            [name, description, price, stock, category, supplier_id, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Rutas CRUD para clientes
app.get('/customers', async (req, res) => {
    try {
        let query = 'SELECT * FROM customers';
        const params = [];

        if (req.query.search) {
            query += ' WHERE name ILIKE $1';
            params.push(`%${req.query.search}%`);
        }

        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

app.post('/customers', async (req, res) => {
    try {
        const { name, email, phone, address, preferred } = req.body;
        const result = await pool.query(
            'INSERT INTO customers (name, email, phone, address, preferred, credit_limit) VALUES ($1, $2, $3, $4, $5, 0) RETURNING *',
            [name, email, phone, address, preferred]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});

app.put('/customers/:id', async (req, res) => {
    try {
        const { name, email, phone, address, preferred } = req.body;
        const result = await pool.query(
            'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, preferred = $5 WHERE id = $6 RETURNING *',
            [name, email, phone, address, preferred, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});

app.delete('/customers/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

// Rutas CRUD para proveedores
app.get('/suppliers', async (req, res) => {
    try {
        let query = 'SELECT * FROM suppliers';
        const params = [];

        if (req.query.search) {
            query += ' WHERE name ILIKE $1';
            params.push(`%${req.query.search}%`);
        }

        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});

app.get('/suppliers/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener proveedor:', error);
        res.status(500).json({ error: 'Error al obtener proveedor' });
    }
});

app.post('/suppliers', async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, status } = req.body;
        const result = await pool.query(
            'INSERT INTO suppliers (name, contact_person, email, phone, address, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, contact_person, email, phone, address, status]
        );
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
});

app.put('/suppliers/:id', async (req, res) => {
    try {
        const { name, contact_person, email, phone, address, status } = req.body;
        const result = await pool.query(
            'UPDATE suppliers SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, status = $6 WHERE id = $7 RETURNING *',
            [name, contact_person, email, phone, address, status, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});

app.delete('/suppliers/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
});

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor backend corriendo en http://0.0.0.0:${PORT}`);
});
