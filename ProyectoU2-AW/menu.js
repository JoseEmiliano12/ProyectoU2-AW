// Protección de sesión
const sesion = JSON.parse(localStorage.getItem("upv_sesion") || "null");
if (!sesion || !sesion.correo) {
  window.location.href = "index.html";
}

// Logout
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("upv_sesion");
    window.location.href = "index.html";
  });
}

// Función para actualizar las estadísticas
function actualizarEstadisticas() {
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  
  // Contar productos
  const totalProductos = productos.length;
  
  // Contar pedidos
  const totalPedidos = pedidos.length;
  
  // Calcular ingresos totales
  let ingresosTotal = 0;
  let itemsTotales = 0;
  
  pedidos.forEach(pedido => {
    ingresosTotal += pedido.total || 0;
    pedido.productos.forEach(item => {
      itemsTotales += item.cantidad;
    });
  });
  
  // Actualizar los contadores en la página
  document.getElementById("contadorProductos").textContent = totalProductos;
  document.getElementById("contadorPedidos").textContent = totalPedidos;
  document.getElementById("contadorIngresos").textContent = `$${ingresosTotal.toFixed(2)}`;
  document.getElementById("contadorItems").textContent = itemsTotales;
}

// Ejecutar al cargar la página
actualizarEstadisticas();