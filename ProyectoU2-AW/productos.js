// proteccion de sesion
const sesion = JSON.parse(localStorage.getItem("upv_sesion") || "null");
if (!sesion || !sesion.correo) {
  window.location.href = "index.html";
}

// logout
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("upv_sesion");
    window.location.href = "index.html";
  });
}

// variables globales
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = null;

const form = document.getElementById("productForm");
const tbody = document.getElementById("tbodyProductos");
const buscarInput = document.getElementById("buscarNombre");
const categoriaSelect = document.getElementById("filtroCategoria");
const ordenarBtn = document.getElementById("ordenarPrecio");

// fincion de productos
function mostrarProductos(listaProductos = productos) {
  tbody.innerHTML = "";
  
  if (listaProductos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
          No hay productos registrados
        </td>
      </tr>
    `;
    return;
  }

  listaProductos.forEach((p, index) => {
    // cantidad de stock
    let stockClass = "stock-disponible";
    let stockText = p.stock + " Unidades";
    
    if (p.stock === 0) {
      stockClass = "stock-agotado";
      stockText = "Agotado";
    } else if (p.stock <= 5) {
      stockClass = "stock-bajo";
      stockText = p.stock + " Unidades";
    }

    const fila = `
      <tr>
        <td><img src="${p.imagen}" class="product-img" alt="${p.nombre}"></td>
        <td><strong>${p.nombre}</strong></td>
        <td><span class="categoria-badge">${p.categoria}</span></td>
        <td><strong>$${p.precio.toFixed(2)}</strong></td>
        <td><span class="stock-badge ${stockClass}">${stockText}</span></td>
        <td>
          <div class="actions">
            <button class="btn btn-warning" onclick="editarProducto(${productos.indexOf(p)})">Editar</button>
            <button class="btn btn-danger" onclick="eliminarProducto(${productos.indexOf(p)})">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

// cargar los productos al inicio
mostrarProductos();
actualizarContadorCarrito();

// AGREGAR/EDITAR PRODUCTO
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stock").value);
  const imagen = document.getElementById("imagen").value.trim();

  // validar
  if (!nombre || !categoria || precio <= 0 || stock < 0 || !imagen) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor, completa todos los campos correctamente."
    });
    return;
  }

  const nuevoProducto = { nombre, categoria, precio, stock, imagen };

  if (editIndex === null) {
    // agregar nuevo producto
    productos.push(nuevoProducto);
    localStorage.setItem("productos", JSON.stringify(productos));
    
    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "Producto agregado correctamente.",
      timer: 1500,
      showConfirmButton: false
    });
  } else {
    // editar existente
    productos[editIndex] = nuevoProducto;
    localStorage.setItem("productos", JSON.stringify(productos));
    editIndex = null;
    
    Swal.fire({
      icon: "info",
      title: "Actualizado",
      text: "Producto editado correctamente.",
      timer: 1500,
      showConfirmButton: false
    });
  }

  form.reset();
  mostrarProductos();
});

// editar productos
function editarProducto(index) {
  const p = productos[index];
  document.getElementById("nombre").value = p.nombre;
  document.getElementById("categoria").value = p.categoria;
  document.getElementById("precio").value = p.precio;
  document.getElementById("stock").value = p.stock;
  document.getElementById("imagen").value = p.imagen;
  editIndex = index;

  // se usa la rueda del raton para ver el formulario arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// eliminar productos
function eliminarProducto(index) {
  Swal.fire({
    title: "¿Eliminar producto?",
    text: "No podrás revertir esta acción.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      productos.splice(index, 1);
      localStorage.setItem("productos", JSON.stringify(productos));
      mostrarProductos();
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "Producto eliminado correctamente.",
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

// agregar a carrito
function agregarAlCarrito(index) {
  const producto = productos[index];
  
  if (producto.stock === 0) {
    Swal.fire({
      icon: "error",
      title: "Sin stock",
      text: "Este producto está agotado."
    });
    return;
  }

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  
  // verificacion si existe en el carrito
  const existe = carrito.find(item => item.nombre === producto.nombre);
  
  if (existe) {
    // Verificar que no se agregue más de las unidades disponibles
    if (existe.cantidad >= producto.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock limitado",
        text: `Solo hay ${producto.stock} unidades disponibles de este producto.`
      });
      return;
    }
    existe.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  
  Swal.fire({
    icon: "success",
    title: "Agregado",
    text: producto.nombre + " agregado al carrito.",
    timer: 1500,
    showConfirmButton: false
  });
}

// actualiza el contador del carrito
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = total;
  }
}

// busca por nombre el producto
buscarInput.addEventListener("input", filtrarProductos);
categoriaSelect.addEventListener("change", filtrarProductos);

function filtrarProductos() {
  const textoBuscar = buscarInput.value.toLowerCase();
  const categoriaFiltro = categoriaSelect.value;

  let productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(textoBuscar);
    const coincideCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

  mostrarProductos(productosFiltrados);
}

// ordena por el precio
let ordenAscendente = true;
ordenarBtn.addEventListener("click", () => {
  const productosOrdenados = [...productos].sort((a, b) => {
    return ordenAscendente ? a.precio - b.precio : b.precio - a.precio;
  });
  
  ordenAscendente = !ordenAscendente;
  ordenarBtn.textContent = ordenAscendente ? "Ordenar por precio ↑" : "Ordenar por precio ↓";
  
  mostrarProductos(productosOrdenados);
});

// borrar todos los productos
const borrarTodosBtn = document.getElementById("borrarTodos");
borrarTodosBtn.addEventListener("click", () => {
  if (productos.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Sin productos",
      text: "No hay productos para borrar."
    });
    return;
  }

  Swal.fire({
    title: "¿Borrar todos los productos?",
    text: "Esta acción eliminará TODOS los productos registrados.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, borrar todos",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      productos = [];
      localStorage.setItem("productos", JSON.stringify(productos));
      mostrarProductos();
      Swal.fire({
        icon: "success",
        title: "Eliminados",
        text: "Todos los productos han sido borrados.",
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
});