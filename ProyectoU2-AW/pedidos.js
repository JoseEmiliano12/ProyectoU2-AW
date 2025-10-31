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
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

const IVA = 0.16;
const CODIGO_ELIMINACION = "2025";

// elementos dom
const productosGrid = document.getElementById("productosGrid");
const buscarInput = document.getElementById("buscarProductos");
const filtroCategoria = document.getElementById("filtroCategoria");
const carritoContenido = document.getElementById("carritoContenido");
const resumenCarrito = document.getElementById("resumenCarrito");
const btnFinalizarPedido = document.getElementById("btnFinalizarPedido");
const pedidosLista = document.getElementById("pedidosLista");

// inicializar
mostrarProductos();
actualizarCarrito();
mostrarPedidos();

// mostrar productos
function mostrarProductos(listaFiltrada = productos) {
  productosGrid.innerHTML = "";
  
  if (listaFiltrada.length === 0) {
    productosGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
        <i class="bi bi-inbox" style="font-size: 60px; margin-bottom: 15px; display: block;"></i>
        <p style="font-size: 16px;">No hay productos disponibles</p>
      </div>
    `;
    return;
  }

  listaFiltrada.forEach((producto) => {
    let stockClass = "";
    let stockText = `${producto.stock} Unidades`;
    let botonDisabled = "";
    
    if (producto.stock === 0) {
      stockClass = "stock-agotado";
      stockText = "Agotado";
      botonDisabled = "disabled";
    } else if (producto.stock <= 5) {
      stockClass = "stock-bajo";
    }

    const cat = (producto.categoria || "Otros").toString();
    const badgeClass = `badge-${cat.toLowerCase().replace(/\s+/g,'-')}`;
    const productoIndex = productos.indexOf(producto);

    const precioBase = Number(producto.precio) || 0;
    const imgSrc = producto.imagen || "img/placeholder.png";
    
    const card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
      <img src="${imgSrc}" class="producto-img" alt="${producto.nombre}">
      <div class="producto-badge ${badgeClass}">${cat}</div>
      <div class="producto-nombre">${producto.nombre}</div>
      <div class="producto-stock ${stockClass}">${stockText}</div>
      <div class="producto-precio">
        $${precioBase.toFixed(2)} <small class="precio-iva">(+ IVA)</small>
      </div>
      <button class="btn-agregar" onclick="agregarAlCarrito(${productoIndex})" ${botonDisabled}>
        Agregar al Carrito
      </button>
    `;
    
    productosGrid.appendChild(card);
  });
}

// filtrar los productos
buscarInput?.addEventListener("input", filtrar);
filtroCategoria?.addEventListener("change", filtrar);

function filtrar() {
  const texto = (buscarInput.value || "").toLowerCase();
  const categoria = filtroCategoria.value;
  
  const filtrados = productos.filter(p => {
    const coincideNombre = (p.nombre || "").toLowerCase().includes(texto);
    const coincideCategoria = !categoria || p.categoria === categoria;
    return coincideNombre && coincideCategoria;
  });
  
  mostrarProductos(filtrados);
}

// agregar carrito
function agregarAlCarrito(index) {
  const producto = productos[index];
  if (!producto) return;
  
  if (producto.stock === 0) {
    Swal.fire({
      icon: "error",
      title: "Sin stock",
      text: "Este producto está agotado."
    });
    return;
  }
  
  const itemCarrito = carrito.find(item => item.nombre === producto.nombre);
  
  if (itemCarrito) {
    if (itemCarrito.cantidad >= producto.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock limitado",
        text: `Solo hay ${producto.stock} unidades disponibles.`
      });
      return;
    }
    itemCarrito.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();


}
// actiualizar carrito
function actualizarCarrito() {
  if (carrito.length === 0) {
    carritoContenido.innerHTML = `
      <div class="carrito-vacio">
        <i class="bi bi-cart-x"></i>
        <p>Tu carrito está vacío</p>
        <small>Agrega productos desde el catálogo</small>
      </div>
    `;
    resumenCarrito.style.display = "none";
    return;
  }
  
  let itemsHTML = '<div class="carrito-items">';
  
  carrito.forEach((item, index) => {
    const productoOriginal = productos.find(p => p.nombre === item.nombre);
    const stockDisponible = productoOriginal ? productoOriginal.stock : 0;
    const imgSrc = item.imagen || "img/placeholder.png";

    itemsHTML += `
      <div class="carrito-item">
        <img src="${imgSrc}" class="carrito-item-img" alt="${item.nombre}">
        <div class="carrito-item-info">
          <div class="carrito-item-nombre">${item.nombre}</div>
          <div class="carrito-item-precio">$${Number(item.precio).toFixed(2)} <small>(s/IVA)</small></div>
          <div class="carrito-item-controls">
            <button class="btn-cantidad" onclick="cambiarCantidad(${index}, -1)" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
            <div class="cantidad-display">${item.cantidad}</div>
            <button class="btn-cantidad" onclick="cambiarCantidad(${index}, 1)" ${item.cantidad >= stockDisponible ? 'disabled' : ''}>+</button>
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
          </div>
        </div>
      </div>
    `;
  });
  
  itemsHTML += '</div>';
  carritoContenido.innerHTML = itemsHTML;
  
  const subtotal = carrito.reduce((sum, item) => sum + (Number(item.precio) * item.cantidad), 0);
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  
  document.getElementById("subtotalCarrito").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("ivaCarrito").textContent = `$${iva.toFixed(2)}`;
  document.getElementById("totalCarrito").textContent = `$${total.toFixed(2)}`;
  
  resumenCarrito.style.display = "block";
}

// cambiar cantidad en carrito
function cambiarCantidad(index, cambio) {
  const item = carrito[index];
  const productoOriginal = productos.find(p => p.nombre === item.nombre);
  if (!productoOriginal) return;
  
  const nuevaCantidad = item.cantidad + cambio;
  
  if (nuevaCantidad > productoOriginal.stock) {
    Swal.fire({
      icon: "warning",
      title: "Stock limitado",
      text: `Solo hay ${productoOriginal.stock} unidades disponibles.`
    });
    return;
  }
  
  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(index);
    return;
  }
  
  carrito[index].cantidad = nuevaCantidad;
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
}

// eliminar carrito perdida un codigo
function eliminarDelCarrito(index) {
  const item = carrito[index];
  if (!item) return;

  Swal.fire({
    title: "Eliminar del carrito",
    text: `Se quitará "${item.nombre}" del carrito.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Continuar",
    cancelButtonText: "Cancelar"
  }).then((res) => {
    if (!res.isConfirmed) return;

    Swal.fire({
      title: "Ingresa el código",
      html: `
        <input type="password" id="codigoEliminarCarrito" class="swal2-input" placeholder="Codigo de seguridad">
        <p style="font-size:12px;color:#999;margin-top:10px;text-align:left;">Código: ${CODIGO_ELIMINACION}</p>
      `,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const codigo = document.getElementById("codigoEliminarCarrito").value;
        if (!codigo) {
          Swal.showValidationMessage("Ingresa el codigo");
          return false;
        }
        if (codigo !== CODIGO_ELIMINACION) {
          Swal.showValidationMessage("Codigo incorrecto");
          return false;
        }
        return true;
      }
    }).then((ok) => {
      if (!ok.isConfirmed) return;

      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarCarrito();

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "Producto eliminado del carrito.",
        timer: 1500,
        showConfirmButton: false
      });
    });
  });
}

// finalizar pedido
btnFinalizarPedido?.addEventListener("click", () => {
  if (carrito.length === 0) return;
  
  let stockSuficiente = true;
  let productosSinStock = [];
  
  carrito.forEach(item => {
    const productoOriginal = productos.find(p => p.nombre === item.nombre);
    if (!productoOriginal || productoOriginal.stock < item.cantidad) {
      stockSuficiente = false;
      productosSinStock.push(item.nombre);
    }
  });
  
  if (!stockSuficiente) {
    Swal.fire({
      icon: "error",
      title: "Stock insuficiente",
      text: `No hay suficiente stock para: ${productosSinStock.join(", ")}`,
      confirmButtonColor: "#dc3545"
    });
    return;
  }
  
  const subtotal = carrito.reduce((sum, item) => sum + (Number(item.precio) * item.cantidad), 0);
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  
  const ahora = new Date();
  const pedidoId = `PED-${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, '0')}${String(ahora.getDate()).padStart(2, '0')}${String(ahora.getHours()).padStart(2, '0')}${String(ahora.getMinutes()).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const dia = ahora.getDate();
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const mes = meses[ahora.getMonth()];
  const año = ahora.getFullYear();
  const hora = ahora.getHours();
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const ampm = hora >= 12 ? 'p.m.' : 'a.m.';
  const hora12 = hora % 12 || 12;
  
  const fecha = `${dia} de ${mes} de ${año}, ${hora12}:${minutos} ${ampm}`;
  
  Swal.fire({
    title: "¿Confirmar pedido?",
    html: `
      <div style="text-align: left; font-size: 14px;">
        <p><strong>Subtotal (s/IVA):</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>IVA (16%):</strong> $${iva.toFixed(2)}</p>
        <p style="font-size: 16px; color: #28a745; margin-top: 10px;"><strong>Total: $${total.toFixed(2)}</strong></p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#007bff",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      const nuevoPedido = {
        id: pedidoId,
        fecha: fecha,
        productos: [...carrito],
        subtotal: subtotal,
        iva: iva,
        total: total,
        estado: "Completado"
      };
      
      carrito.forEach(item => {
        const productoIndex = productos.findIndex(p => p.nombre === item.nombre);
        if (productoIndex !== -1) {
          productos[productoIndex].stock -= item.cantidad;
        }
      });
      
      pedidos.unshift(nuevoPedido);
      localStorage.setItem("pedidos", JSON.stringify(pedidos));
      localStorage.setItem("productos", JSON.stringify(productos));
      
      carrito = [];
      localStorage.setItem("carrito", JSON.stringify(carrito));
      
      actualizarCarrito();
      mostrarPedidos();
      mostrarProductos();
      
      Swal.fire({
        icon: "success",
        title: "Pedido realizado",
        text: `ID: ${pedidoId}`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
});

// mostrar pedidos
function mostrarPedidos() {
  if (pedidos.length === 0) {
    pedidosLista.innerHTML = '<p class="texto-vacio">No hay pedidos registrados</p>';
    return;
  }
  
  pedidosLista.innerHTML = "";
  
  pedidos.forEach((pedido, index) => {
    const pedidoDiv = document.createElement("div");
    pedidoDiv.className = "pedido-item";
    
    const cantidadProductos = pedido.productos.reduce((sum, p) => sum + p.cantidad, 0);
    
    pedidoDiv.innerHTML = `
      <div class="pedido-header">
        <div class="pedido-id">${pedido.id}</div>
        <div class="pedido-estado">${pedido.estado}</div>
      </div>
      <div class="pedido-fecha">${pedido.fecha}</div>
      <div class="pedido-productos">${cantidadProductos} Producto(s)</div>
      <div class="pedido-total">$${pedido.total.toFixed(2)}</div>
      <button class="btn-eliminar-pedido" onclick="eliminarPedido(${index})">
        <i class="bi bi-trash"></i> Eliminar Pedido
      </button>
    `;
    
    pedidosLista.appendChild(pedidoDiv);
  });
}

// eliminar pedido
function eliminarPedido(index) {
  const pedido = pedidos[index];
  if (!pedido) return;
  
  Swal.fire({
    title: "¿Estás seguro?",
    text: `Se eliminará el pedido ${pedido.id}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (!result.isConfirmed) return;

    // regresar el stock
    pedido.productos.forEach(item => {
      const i = productos.findIndex(p => p.nombre === item.nombre);
      if (i !== -1) productos[i].stock += item.cantidad;
    });
    
    // eliminar pedidos y guardar
    pedidos.splice(index, 1);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    localStorage.setItem("productos", JSON.stringify(productos));
    
    mostrarPedidos();
    mostrarProductos();
    
    Swal.fire({
      icon: "success",
      title: "Eliminado",
      text: "Pedido eliminado correctamente",
      timer: 1500,
      showConfirmButton: false
    });
  });
}