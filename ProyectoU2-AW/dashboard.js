// --------------------- PROTECCION DE SESION ---------------------
const sesion = JSON.parse(localStorage.getItem("upv_sesion") || "null");

if (!sesion || !sesion.correo) {
  window.location.href = "index.html";
}



// --------------------- LOGOUT ---------------------
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("upv_sesion");
    window.location.href = "index.html";
  });
}



// --------------------- CARGA DE DATOS DEL LOCALSTORAGE ---------------------
const productos = JSON.parse(localStorage.getItem("productos")) || [];
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];



// --------------------- FUNCION QUE CALCULA TODAS LAS GRAFICAS ---------------------
function calcularEstadisticas() {
  // Total de productos registrados
  let totalProductos = productos.length;
  // Total de pedidos registrados
  let totalPedidos = pedidos.length;
  // Acumulador de dinero ganado
  let ingresosTotal = 0;
  // Acumulador de unidades vendidas
  let productosVendidos = 0;


  const ventasPorProducto = {};
  const ventasPorCategoria = {};

  // Recorremos todos los pedidos
  pedidos.forEach(pedido => {
    // Sumamos cuanto dejo ese pedido si no tiene total se queda en 0
    ingresosTotal += pedido.total || 0;
    
    // Cada pedido cuenta con un array de productos vendidos
    pedido.productos.forEach(item => {
      // Sumamos las unidades vendidas
      productosVendidos += item.cantidad;
      
      // --------- CONTAR VENTAS POR PRODUCTO ---------
      if (ventasPorProducto[item.nombre]) {
        ventasPorProducto[item.nombre].cantidad += item.cantidad;
        ventasPorProducto[item.nombre].ingresos += (item.precio * item.cantidad);
      } else {
        ventasPorProducto[item.nombre] = {
          nombre: item.nombre,
          categoria: item.categoria || "Otros",
          cantidad: item.cantidad,
          ingresos: item.precio * item.cantidad
        };
      }
      
      // --------- CONTAR INGRESOS POR CATEGORÍA ---------
      const categoria = item.categoria || "Otros";
      if (ventasPorCategoria[categoria]) {
        ventasPorCategoria[categoria] += (item.precio * item.cantidad);
      } else {
        ventasPorCategoria[categoria] = item.precio * item.cantidad;
      }
    });
  });

  // Regresamos un solo objeto con todo lo calculado
  return {
    totalProductos,
    totalPedidos,
    ingresosTotal,
    productosVendidos,
    ventasPorProducto,
    ventasPorCategoria
  };
}



// --------------------- TARJETAS DEL DASHBOARD ---------------------
function actualizarTarjetas(stats) {
  // Asignamos los valores 
  document.getElementById("totalProductos").textContent = stats.totalProductos;
  document.getElementById("totalPedidos").textContent = stats.totalPedidos;
  document.getElementById("ingresosTotal").textContent = `$${stats.ingresosTotal.toFixed(2)}`;
  document.getElementById("productosVendidos").textContent = stats.productosVendidos;
}



// --------------------- grafica de barras de productos mas vendidos  ---------------------
function crearGraficaProductos(ventasPorProducto) {
  const ctx = document.getElementById('chartProductos');
  
  // objeto en array para poder ordenarlo
  const productosArray = Object.values(ventasPorProducto);
  // ordenamiento de mayor a menor por cantidad vendida
  productosArray.sort((a, b) => b.cantidad - a.cantidad);
  // Tomamos solo los primeros 5
  const top5 = productosArray.slice(0, 5);

  // Si no hay datos, mostramos un texto en el canvas
  if (top5.length === 0) {
    const c = ctx.getContext('2d');
    c.font = '16px Arial';
    c.fillStyle = '#999';
    c.textAlign = 'center';
    c.fillText('No hay datos de ventas', ctx.width / 2, ctx.height / 2);
    return;
  }

  // Etiquetas (nombres de producto)
  const labels = top5.map(p => p.nombre);
  // Datos (unidades vendidas)
  const data = top5.map(p => p.cantidad);

  // grafica con Chart.js
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Unidades Vendidas',
        data: data,
        // Colores de las barras
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(237, 100, 166, 0.8)',
          'rgba(255, 154, 158, 0.8)',
          'rgba(250, 208, 196, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(237, 100, 166, 1)',
          'rgba(255, 154, 158, 1)',
          'rgba(250, 208, 196, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,          // adaptador al contenedor
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false        
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1          // sube de 1 en 1
          }
        }
      }
    }
  });
}



// --------------------- Grafica de pastel de ingresos por categoria ---------------------
function crearGraficaCategorias(ventasPorCategoria) {
  const ctx = document.getElementById('chartCategorias');

  // Obtenemos las categorias y sus montos
  const categorias = Object.keys(ventasPorCategoria);
  const ingresos = Object.values(ventasPorCategoria);

  // Si no se encuentran datos se escribe en el canvas
  if (categorias.length === 0) {
    const c = ctx.getContext('2d');
    c.font = '16px Arial';
    c.fillStyle = '#999';
    c.textAlign = 'center';
    c.fillText('No hay datos de ingresos', ctx.width / 2, ctx.height / 2);
    return;
  }

  // grafica de pastel con Chart.js
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categorias,
      datasets: [{
        label: 'Ingresos ($)',
        data: ingresos,
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              label += '$' + context.parsed.toFixed(2);
              return label;
            }
          }
        }
      }
    }
  });
}



// --------------------- TABLA DE RESUMEN ---------------------
function llenarTablaResumen(ventasPorProducto) {
  const tbody = document.getElementById("tablaResumen");
  // se limpia si ahi algo
  tbody.innerHTML = "";
  // Pasamos el objeto a array
  const productosArray = Object.values(ventasPorProducto);
  // Si no hay nada se muestra una fila vacia
  if (productosArray.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay datos disponibles</td></tr>';
    return;
  }
  // Ordenamiento de mayor a menor por cantidad vendida
  productosArray.sort((a, b) => b.cantidad - a.cantidad);
  // Por cada producto se arma una fila con html
  productosArray.forEach(producto => {
    const fila = `
      <tr>
        <td><strong>${producto.nombre}</strong></td>
        <td><span class="badge bg-info">${producto.categoria}</span></td>
        <td><strong>${producto.cantidad}</strong> unidades</td>
        <td class="text-success"><strong>$${producto.ingresos.toFixed(2)}</strong></td>
      </tr>
    `;
    // se agrega a la tabla
    tbody.innerHTML += fila;
  });
}



// --------------------- inicializador del DASHBOARD ---------------------
function inicializarDashboard() {
  // Calcula todo
  const stats = calcularEstadisticas();
  
  // actualiza las tarjetas
  actualizarTarjetas(stats);
  // crea lo que es las graficas
  crearGraficaProductos(stats.ventasPorProducto);
  crearGraficaCategorias(stats.ventasPorCategoria);
  // llena las tablas 
  llenarTablaResumen(stats.ventasPorProducto);
}


2

inicializarDashboard();
