// Configuración de la API
const API_URL = 'http://localhost:3000';

// Elementos DOM para filtrado y búsqueda
const productSearch = document.getElementById('product-search');
const categoryFilter = document.getElementById('category-filter');
const customerSearch = document.getElementById('customer-search');
const preferredFilter = document.getElementById('preferred-filter');
const supplierSearch = document.getElementById('supplier-search');

// Variables globales
let products = [];
let currentView = '';

// Función para mostrar alertas
function showAlert(type, message) {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) {
        console.error('No se encontró el contenedor de alertas');
        return;
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}

// Asegurarse de que el DOM esté cargado antes de ejecutar código
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales
    showView('products');
});

// Funciones CRUD para Productos
async function addProduct(product) {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        if (!response.ok) throw new Error('Error al agregar producto');
        await loadProducts();
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar producto');
        return false;
    }
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const { data: product } = await response.json();
        
        // Llenar el formulario de edición
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-category').value = product.category;
        document.getElementById('edit-product-unit').value = product.unit_type;
        document.getElementById('edit-product-price').value = product.unit_price;
        document.getElementById('edit-product-stock').value = product.stock;
        document.getElementById('edit-product-supplier').value = product.supplier_name;
        
        // Mostrar modal
        const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
        editModal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar producto');
    }
}

async function updateProduct(id, product) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        if (!response.ok) throw new Error('Error al actualizar producto');
        await loadProducts();
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar producto');
        return false;
    }
}

async function deleteProduct(id) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar producto');
            await loadProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar producto');
        }
    }
}

// Funciones CRUD para Clientes
async function addCustomer(customer) {
    try {
        const response = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customer)
        });
        if (!response.ok) throw new Error('Error al agregar cliente');
        await loadCustomers();
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar cliente');
        return false;
    }
}

async function editCustomer(id) {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`);
        const { data: customer } = await response.json();
        
        // Llenar el formulario de edición
        document.getElementById('edit-customer-id').value = customer.id;
        document.getElementById('edit-customer-name').value = customer.name;
        document.getElementById('edit-customer-phone').value = customer.phone;
        document.getElementById('edit-customer-email').value = customer.email;
        document.getElementById('edit-customer-address').value = customer.address;
        document.getElementById('edit-customer-preferred').checked = customer.preferred;
        
        // Mostrar modal
        const editModal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
        editModal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar cliente');
    }
}

async function updateCustomer(id, customer) {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customer)
        });
        if (!response.ok) throw new Error('Error al actualizar cliente');
        await loadCustomers();
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar cliente');
        return false;
    }
}

async function deleteCustomer(id) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        try {
            const response = await fetch(`${API_URL}/customers/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar cliente');
            await loadCustomers();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar cliente');
        }
    }
}

// Funciones CRUD para Proveedores
async function addSupplier(supplier) {
    try {
        const response = await fetch(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplier)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear el proveedor');
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error al agregar proveedor:', error);
        throw error;
    }
}

async function loadSuppliers() {
    try {
        const search = document.getElementById('supplier-search')?.value || '';
        const response = await fetch(`${API_URL}/suppliers?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        
        const tbody = document.getElementById('suppliers-table');
        tbody.innerHTML = '';
        
        data.data.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.name}</td>
                <td>${supplier.email || '-'}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.address || '-'}</td>
                <td>${supplier.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showEditSupplierModal(${supplier.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${supplier.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        showAlert('danger', 'Error al cargar los proveedores');
    }
}

async function deleteSupplier(id) {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) return;
    
    try {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        // Recargar la lista de proveedores
        loadSuppliers();
        
        // Mostrar mensaje de éxito
        showAlert('success', 'Proveedor eliminado correctamente');
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        showAlert('danger', 'Error al eliminar el proveedor');
    }
}

document.getElementById('new-supplier-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const formData = {
            name: document.getElementById('new-supplier-name').value,
            email: document.getElementById('new-supplier-email').value,
            phone: document.getElementById('new-supplier-phone').value,
            address: document.getElementById('new-supplier-address').value,
            active: document.getElementById('new-supplier-active').checked
        };
        
        await addSupplier(formData);
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newSupplierModal'));
        modal.hide();
        
        // Limpiar el formulario
        e.target.reset();
        
        // Recargar la lista de proveedores
        loadSuppliers();
        
        // Mostrar mensaje de éxito
        showAlert('success', 'Proveedor agregado correctamente');
    } catch (error) {
        console.error('Error al agregar proveedor:', error);
        showAlert('danger', 'Error al agregar el proveedor');
    }
});

// Funciones de carga de datos
async function loadProducts() {
    try {
        const search = document.getElementById('product-search')?.value || '';
        const category = document.getElementById('category-filter')?.value || '';
        
        let url = `${API_URL}/products`;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        
        const data = await response.json();
        const tbody = document.getElementById('products-table');
        tbody.innerHTML = '';
        
        data.data.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.description || '-'}</td>
                <td>${product.category}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.supplier_name || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showEditProductModal(${product.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Actualizar el select de categorías si está vacío
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter && categoryFilter.options.length <= 1) {
            const categories = [...new Set(data.data.map(product => product.category))].sort();
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
            });
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos');
    }
}

async function loadCustomers() {
    try {
        const search = document.getElementById('customer-search')?.value || '';
        const response = await fetch(`${API_URL}/customers?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        
        const tbody = document.getElementById('customers-table');
        tbody.innerHTML = '';
        
        data.data.forEach(customer => {
            const totalSpent = parseFloat(customer.total_spent) || 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.address || '-'}</td>
                <td>${customer.preferred ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-secondary"></i>'}</td>
                <td>${customer.last_purchase ? new Date(customer.last_purchase).toLocaleDateString() : '-'}</td>
                <td>$${totalSpent.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showEditCustomerModal(${customer.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer(${customer.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        alert('Error al cargar los clientes');
    }
}

// Funciones de carga de datos
async function loadSuppliers() {
    try {
        const search = document.getElementById('supplier-search')?.value || '';
        const response = await fetch(`${API_URL}/suppliers?search=${encodeURIComponent(search)}`);
        const data = await response.json();
        
        const tbody = document.getElementById('suppliers-table');
        tbody.innerHTML = '';
        
        data.data.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.name}</td>
                <td>${supplier.contact_person || '-'}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.email || '-'}</td>
                <td>${supplier.address || '-'}</td>
                <td>${supplier.products_count || 0}</td>
                <td>${supplier.last_delivery ? new Date(supplier.last_delivery).toLocaleDateString() : '-'}</td>
                <td>$${parseFloat(supplier.balance || 0).toFixed(2)}</td>
                <td><span class="badge ${supplier.status === 'Activo' ? 'bg-success' : 'bg-danger'}">${supplier.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showEditSupplierModal(${supplier.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier(${supplier.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        alert('Error al cargar los proveedores');
    }
}

// Función para mostrar/ocultar vistas
async function showView(viewName) {
    try {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(view => view.style.display = 'none');
        
        // Mostrar la vista seleccionada
        const selectedView = document.getElementById(`${viewName}-view`);
        if (!selectedView) {
            throw new Error(`Vista ${viewName} no encontrada`);
        }
        
        selectedView.style.display = 'block';
        currentView = viewName;
        
        // Cargar datos según la vista
        switch (viewName) {
            case 'products':
                await loadProducts();
                break;
            case 'customers':
                await loadCustomers();
                break;
            case 'suppliers':
                await loadSuppliers();
                break;
            case 'sales':
                await loadSales();
                await loadCustomers(); // Para el select de clientes
                await loadProducts(); // Para el select de productos
                addProductRow(); // Agregar primera fila de productos
                break;
            case 'reservations':
                await loadReservations();
                break;
        }
        
        // Actualizar navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick')?.includes(viewName)) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error(`Error al mostrar vista ${viewName}:`, error);
        showAlert('danger', `Error al cargar la vista ${viewName}`);
    }
}

// Event listeners para navegación
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar la vista de productos por defecto
    showView('products');
    
    // Agregar event listeners a los enlaces de navegación
    document.querySelectorAll('[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            showView(view);
        });
    });
});

// Funciones para modales
function showNewProductModal() {
    const modalElement = document.getElementById('newProductModal');
    if (!modalElement) {
        console.error('Modal element not found: newProductModal');
        return;
    }
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function showNewCustomerModal() {
    const modalElement = document.getElementById('newCustomerModal');
    if (!modalElement) {
        console.error('Modal element not found: newCustomerModal');
        return;
    }
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function showNewSupplierModal() {
    const modalElement = document.getElementById('newSupplierModal');
    if (!modalElement) {
        console.error('Modal element not found: newSupplierModal');
        return;
    }
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function showNewSaleModal() {
    const modalElement = document.getElementById('newSaleModal');
    if (!modalElement) {
        console.error('Modal element not found: newSaleModal');
        return;
    }
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function showNewReservationModal() {
    const modalElement = document.getElementById('newReservationModal');
    if (!modalElement) {
        console.error('Modal element not found: newReservationModal');
        return;
    }
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

async function showEditCustomerModal(customerId) {
    try {
        const response = await fetch(`${API_URL}/customers/${customerId}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        const customer = data.data;
        
        // Llenar el formulario con los datos del cliente
        document.getElementById('edit-customer-name').value = customer.name;
        document.getElementById('edit-customer-email').value = customer.email;
        document.getElementById('edit-customer-phone').value = customer.phone;
        document.getElementById('edit-customer-address').value = customer.address;
        document.getElementById('edit-customer-preferred').checked = customer.preferred;
        
        // Guardar el ID del cliente en el formulario
        document.getElementById('edit-customer-form').dataset.customerId = customerId;
        
        // Mostrar el modal
        const modal = document.getElementById('editCustomerModal');
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
        alert('Error al cargar los datos del cliente. Por favor intente nuevamente.');
    }
}

async function showEditSupplierModal(supplierId) {
    try {
        const response = await fetch(`${API_URL}/suppliers/${supplierId}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        const supplier = data.data;
        
        // Llenar el formulario con los datos del proveedor
        document.getElementById('edit-supplier-name').value = supplier.name;
        document.getElementById('edit-supplier-email').value = supplier.email;
        document.getElementById('edit-supplier-phone').value = supplier.phone;
        document.getElementById('edit-supplier-address').value = supplier.address;
        document.getElementById('edit-supplier-active').checked = supplier.active;
        
        // Guardar el ID del proveedor en el formulario
        document.getElementById('edit-supplier-form').dataset.supplierId = supplierId;
        
        // Mostrar el modal
        const modal = document.getElementById('editSupplierModal');
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    } catch (error) {
        console.error('Error al cargar datos del proveedor:', error);
        alert('Error al cargar los datos del proveedor. Por favor intente nuevamente.');
    }
}

// Funciones para manipular ventas
function addProductToSale() {
    const productItem = document.querySelector('.product-item').cloneNode(true);
    document.getElementById('sale-products').appendChild(productItem);
}

function removeProductFromSale(button) {
    const productItems = document.querySelectorAll('.product-item');
    if (productItems.length > 1) {
        button.closest('.product-item').remove();
    }
}

// Event listeners para filtros
productSearch.addEventListener('input', debounce(loadProducts, 300));
categoryFilter.addEventListener('change', loadProducts);
customerSearch.addEventListener('input', debounce(loadCustomers, 300));
preferredFilter.addEventListener('change', loadCustomers);
supplierSearch.addEventListener('input', debounce(loadSuppliers, 300));

// Manejadores de formularios
document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        unit_type: formData.get('unit_type'),
        unit_price: parseFloat(formData.get('unit_price')),
        stock: parseInt(formData.get('stock')),
        supplier_name: formData.get('supplier_name')
    };
    if (await addProduct(product)) {
        e.target.reset();
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
    }
});

document.getElementById('edit-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        unit_type: formData.get('unit_type'),
        unit_price: parseFloat(formData.get('unit_price')),
        stock: parseInt(formData.get('stock')),
        supplier_name: formData.get('supplier_name')
    };
    if (await updateProduct(id, product)) {
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
    }
});

document.getElementById('add-customer-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customer = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        preferred: formData.get('preferred') === 'on'
    };
    if (await addCustomer(customer)) {
        e.target.reset();
        bootstrap.Modal.getInstance(document.getElementById('newCustomerModal')).hide();
    }
});

document.getElementById('edit-customer-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const customerId = e.target.dataset.customerId;
        const formData = {
            name: document.getElementById('edit-customer-name').value,
            email: document.getElementById('edit-customer-email').value,
            phone: document.getElementById('edit-customer-phone').value,
            address: document.getElementById('edit-customer-address').value,
            preferred: document.getElementById('edit-customer-preferred').checked
        };
        
        const response = await fetch(`${API_URL}/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCustomerModal'));
        modal.hide();
        
        // Recargar la lista de clientes
        loadCustomers();
        
        // Mostrar mensaje de éxito
        showAlert('success', 'Cliente actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        showAlert('danger', 'Error al actualizar el cliente');
    }
});

document.getElementById('add-supplier-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const supplier = {
        name: formData.get('name'),
        contact_person: formData.get('contact_person'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        status: 'Activo'
    };
    if (await addSupplier(supplier)) {
        e.target.reset();
        bootstrap.Modal.getInstance(document.getElementById('newSupplierModal')).hide();
    }
});

document.getElementById('edit-supplier-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const supplierId = e.target.dataset.supplierId;
        const formData = {
            name: document.getElementById('edit-supplier-name').value,
            email: document.getElementById('edit-supplier-email').value,
            phone: document.getElementById('edit-supplier-phone').value,
            address: document.getElementById('edit-supplier-address').value,
            active: document.getElementById('edit-supplier-active').checked
        };
        
        const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplierModal'));
        modal.hide();
        
        // Recargar la lista de proveedores
        loadSuppliers();
        
        // Mostrar mensaje de éxito
        showAlert('success', 'Proveedor actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        showAlert('danger', 'Error al actualizar el proveedor');
    }
});

// Funciones para el modal de ventas
async function loadSaleModalData() {
    try {
        // Cargar clientes para el select
        const clientsResponse = await fetch(`${API_URL}/customers`);
        console.log('Fetch terminó de cargar:', clientsResponse.url);
        const clientsData = await clientsResponse.json();
        const clientSelect = document.getElementById('sale-customer');
        clientSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
        clientsData.data.forEach(client => {
            clientSelect.innerHTML += `<option value="${client.id}">${client.name}</option>`;
        });

        // Cargar productos para el select
        const productsResponse = await fetch(`${API_URL}/products`);
        console.log('Fetch terminó de cargar:', productsResponse.url);
        const productsData = await productsResponse.json();
        const productSelects = document.querySelectorAll('.sale-product');
        productSelects.forEach(select => {
            select.innerHTML = '<option value="">Seleccione un producto</option>';
            productsData.data.forEach(product => {
                select.innerHTML += `
                    <option value="${product.id}" data-price="${product.price}">
                        ${product.name} - $${parseFloat(product.price).toFixed(2)}
                    </option>
                `;
            });
        });

        // Calcular total inicial
        calculateTotal();
    } catch (error) {
        console.error('Error al cargar datos del modal:', error);
        alert('Error al cargar los datos. Por favor intente nuevamente.');
    }
}

function updateSaleTotal() {
    try {
        const quantities = document.querySelectorAll('.sale-quantity');
        const productSelects = document.querySelectorAll('.sale-product');
        let total = 0;

        for (let i = 0; i < quantities.length; i++) {
            const quantity = parseFloat(quantities[i].value) || 0;
            const selectedOption = productSelects[i].selectedOptions[0];
            if (selectedOption && selectedOption.dataset.price) {
                const price = parseFloat(selectedOption.dataset.price) || 0;
                total += quantity * price;
            }
        }

        const totalInput = document.getElementById('sale-total');
        if (isNaN(total)) {
            totalInput.value = "0.00";
        } else {
            totalInput.value = total.toFixed(2);
        }
    } catch (error) {
        console.error('Error al calcular el total:', error);
        document.getElementById('sale-total').value = "0.00";
    }
}

// Event listener para el modal de ventas
document.getElementById('newSaleModal')?.addEventListener('show.bs.modal', async () => {
    await loadSaleModalData();
});

// Event listeners para actualizar total
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('sale-quantity') || e.target.classList.contains('sale-product')) {
        updateSaleTotal();
    }
});

// Función para crear una venta
async function createSale(event) {
    event.preventDefault();
    
    try {
        const customerId = document.getElementById('sale-customer').value;
        const productRows = document.querySelectorAll('#sale-products tbody tr');
        let total = 0;
        const products = [];
        
        // Recopilar productos y calcular total
        productRows.forEach(row => {
            const productId = row.querySelector('select').value;
            const quantity = parseInt(row.querySelector('input[type="number"]').value);
            const price = parseFloat(row.querySelector('.product-price').textContent);
            
            if (productId && quantity > 0) {
                products.push({
                    id: parseInt(productId),
                    quantity,
                    price
                });
                total += price * quantity;
            }
        });
        
        if (products.length === 0) {
            throw new Error('Debe agregar al menos un producto');
        }
        
        const response = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_id: parseInt(customerId),
                products,
                total
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Limpiar el formulario
        document.getElementById('new-sale-form').reset();
        document.getElementById('sale-products').querySelector('tbody').innerHTML = '';
        addProductRow(); // Agregar una fila vacía
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newSaleModal'));
        modal.hide();
        
        // Recargar la lista de ventas
        loadSales();
        
        // Mostrar mensaje de éxito
        showAlert('success', 'Venta creada correctamente');
    } catch (error) {
        console.error('Error al crear venta:', error);
        showAlert('danger', error.message || 'Error al crear la venta');
    }
}

// Event listener para el formulario de venta
document.getElementById('add-sale-form')?.addEventListener('submit', createSale);

// Función para calcular el total de la venta
function calculateTotal() {
    let total = 0;
    const productSelects = document.querySelectorAll('.sale-product');
    const quantityInputs = document.querySelectorAll('.sale-quantity');
    
    for (let i = 0; i < productSelects.length; i++) {
        const productSelect = productSelects[i];
        const quantityInput = quantityInputs[i];
        
        if (productSelect.value && quantityInput.value) {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const price = parseFloat(selectedOption.getAttribute('data-price') || '0');
            const quantity = parseInt(quantityInput.value) || 0;
            total += price * quantity;
        }
    }
    
    // Actualizar el campo de total
    const totalInput = document.getElementById('sale-total');
    if (totalInput) {
        totalInput.value = total.toFixed(2);
    }
    
    return total;
}

// Event listener para actualizar el total cuando cambian los productos o cantidades
document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('products-container');
    if (productContainer) {
        productContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('sale-product') || e.target.classList.contains('sale-quantity')) {
                calculateTotal();
            }
        });
    }
});

// Función de debounce para evitar muchas llamadas seguidas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCustomers();
    loadSuppliers();
});

// Función para cargar reservas
async function loadReservations() {
    // Por ahora solo mostramos un mensaje
    const reservationsView = document.getElementById('reservations-view');
    if (reservationsView) {
        reservationsView.innerHTML = `
            <div class="alert alert-info">
                <h4><i class="bi bi-info-circle"></i> Próximamente</h4>
                <p>La funcionalidad de reservas estará disponible próximamente.</p>
            </div>
        `;
    }
}

// Función para cargar ventas
async function loadSales() {
    try {
        const response = await fetch(`${API_URL}/sales`);
        const data = await response.json();
        
        const salesTable = document.getElementById('sales-table');
        if (!salesTable) {
            console.error('No se encontró la tabla de ventas');
            return;
        }
        
        salesTable.innerHTML = '';
        
        data.data.forEach(sale => {
            const date = new Date(sale.date).toLocaleString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${sale.customer_name || 'Cliente no disponible'}</td>
                <td>${sale.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                <td>${sale.status}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewSaleDetails(${sale.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSale(${sale.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            salesTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar ventas:', error);
        alert('Error al cargar las ventas. Por favor intente nuevamente.');
    }
}

// Función para mostrar una vista
async function showView(viewName) {
    try {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(view => view.style.display = 'none');
        
        // Mostrar la vista seleccionada
        const selectedView = document.getElementById(`${viewName}-view`);
        if (!selectedView) {
            throw new Error(`Vista ${viewName} no encontrada`);
        }
        
        selectedView.style.display = 'block';
        currentView = viewName;
        
        // Cargar datos según la vista
        switch (viewName) {
            case 'products':
                await loadProducts();
                break;
            case 'customers':
                await loadCustomers();
                break;
            case 'suppliers':
                await loadSuppliers();
                break;
            case 'sales':
                await loadSales();
                await loadCustomers(); // Para el select de clientes
                await loadProducts(); // Para el select de productos
                addProductRow(); // Agregar primera fila de productos
                break;
            case 'reservations':
                await loadReservations();
                break;
        }
        
        // Actualizar navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick')?.includes(viewName)) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error(`Error al mostrar vista ${viewName}:`, error);
        showAlert('danger', `Error al cargar la vista ${viewName}`);
    }
}

// Función para ver detalles de una venta
async function viewSaleDetails(saleId) {
    try {
        const response = await fetch(`${API_URL}/sales/${saleId}`);
        const data = await response.json();
        const sale = data.data;

        // Crear modal dinámicamente
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'saleDetailsModal';
        modal.setAttribute('tabindex', '-1');

        const date = new Date(sale.date).toLocaleString();
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles de la Venta #${sale.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>Cliente:</strong> ${sale.customer_name}</p>
                                <p><strong>Fecha:</strong> ${date}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Total:</strong> ${sale.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                                <p><strong>Estado:</strong> ${sale.status}</p>
                            </div>
                        </div>
                        <h6>Productos:</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unitario</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sale.details.map(detail => `
                                        <tr>
                                            <td>${detail.product_name}</td>
                                            <td>${detail.quantity}</td>
                                            <td>${detail.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                            <td>${(detail.quantity * detail.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        // Eliminar modal anterior si existe
        const oldModal = document.getElementById('saleDetailsModal');
        if (oldModal) {
            oldModal.remove();
        }

        // Agregar nuevo modal al body
        document.body.appendChild(modal);

        // Mostrar modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error al cargar detalles de la venta:', error);
        alert('Error al cargar los detalles de la venta. Por favor intente nuevamente.');
    }
}

// Función para eliminar una venta
async function deleteSale(saleId) {
    if (!confirm('¿Está seguro de que desea eliminar esta venta?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/sales/${saleId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Recargar ventas
        loadSales();
        alert('Venta eliminada exitosamente');
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        alert('Error al eliminar la venta. Por favor intente nuevamente.');
    }
}

// Función para agregar una fila de producto en la venta
function addProductRow() {
    const tbody = document.querySelector('#sale-products tbody');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="form-select product-select" required>
                <option value="">Seleccione un producto</option>
                ${products.map(p => `
                    <option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}">
                        ${p.name} - Stock: ${p.stock}
                    </option>
                `).join('')}
            </select>
        </td>
        <td>
            <input type="number" class="form-control product-quantity" min="1" value="1" required>
        </td>
        <td class="text-end">
            <span class="product-price">0.00</span>
        </td>
        <td class="text-end">
            <span class="product-subtotal">0.00</span>
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeProductRow(this)">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Configurar event listeners
    const select = row.querySelector('.product-select');
    const quantity = row.querySelector('.product-quantity');
    
    select.addEventListener('change', updateProductPrice);
    quantity.addEventListener('change', updateProductSubtotal);
    quantity.addEventListener('input', updateProductSubtotal);
}

// Función para remover una fila de producto
function removeProductRow(button) {
    const row = button.closest('tr');
    if (row.parentElement.children.length > 1) {
        row.remove();
    } else {
        // Si es la última fila, solo limpiar los valores
        const select = row.querySelector('.product-select');
        const quantity = row.querySelector('.product-quantity');
        select.value = '';
        quantity.value = 1;
    }
    updateTotal();
}

// Función para actualizar el precio cuando se selecciona un producto
function updateProductPrice(event) {
    const select = event.target;
    const row = select.closest('tr');
    const option = select.selectedOptions[0];
    
    const price = option.dataset.price || 0;
    row.querySelector('.product-price').textContent = parseFloat(price).toFixed(2);
    
    updateProductSubtotal(event);
}

// Función para actualizar el subtotal de un producto
function updateProductSubtotal(event) {
    const row = event.target.closest('tr');
    const price = parseFloat(row.querySelector('.product-price').textContent);
    const quantity = parseInt(row.querySelector('.product-quantity').value) || 0;
    
    const subtotal = price * quantity;
    row.querySelector('.product-subtotal').textContent = subtotal.toFixed(2);
    
    updateTotal();
}

// Función para actualizar el total de la venta
function updateTotal() {
    const subtotals = document.querySelectorAll('.product-subtotal');
    const total = Array.from(subtotals)
        .reduce((sum, el) => sum + parseFloat(el.textContent), 0);
    
    document.getElementById('sale-total').textContent = total.toFixed(2);
}

// Event listener para el botón de agregar producto
document.getElementById('add-product-btn')?.addEventListener('click', addProductRow);

// Event listener para el formulario de nueva venta
document.getElementById('new-sale-form')?.addEventListener('submit', createSale);
