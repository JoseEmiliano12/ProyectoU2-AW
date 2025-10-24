let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = null;

const form = document.getElementById("productForm");
const tbody = document.getElementById("tbodyProductos");

function mostrarProductos() {
  tbody.innerHTML = "";
  productos.forEach((p, index) => {
    const fila = `
      <tr>
        <td><img src="${p.imagen}" class="product-img"></td>
        <td>${p.nombre}</td>
        <td>${p.categoria}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarProducto(${index})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">Eliminar</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}
mostrarProductos();

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stock").value);
  const imagen = document.getElementById("imagen").value.trim();

  // Validación
  if (!nombre || !categoria || precio <= 0 || stock < 0 || !imagen) {
    Swal.fire("Error", "Por favor, completa todos los campos correctamente.", "error");
    return;
  }

  const nuevoProducto = { nombre, categoria, precio, stock, imagen };

  if (editIndex === null) {
    productos.push(nuevoProducto);
    Swal.fire("Éxito", "Producto agregado correctamente.", "success");
  } else {
    productos[editIndex] = nuevoProducto;
    editIndex = null;
    Swal.fire("Actualizado", "Producto editado correctamente.", "info");
  }

  localStorage.setItem("productos", JSON.stringify(productos));
  form.reset();
  mostrarProductos();
});

function editarProducto(index) {
  const p = productos[index];
  document.getElementById("nombre").value = p.nombre;
  document.getElementById("categoria").value = p.categoria;
  document.getElementById("precio").value = p.precio;
  document.getElementById("stock").value = p.stock;
  document.getElementById("imagen").value = p.imagen;
  editIndex = index;
}

function eliminarProducto(index) {
  Swal.fire({
    title: "¿Eliminar producto?",
    text: "No podrás revertir esto.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      productos.splice(index, 1);
      localStorage.setItem("productos", JSON.stringify(productos));
      mostrarProductos();
      Swal.fire("Eliminado", "Producto eliminado correctamente.", "success");
    }
  });
}
