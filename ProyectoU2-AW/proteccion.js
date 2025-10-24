// proteccion de sesion agregar a todas las paginas ale al inicio
(function() {
  const sesion = JSON.parse(localStorage.getItem("upv_sesion") || "null");
  
  if (!sesion || !sesion.correo) {
    // Si no hay sesión, redirigir al login
    window.location.href = "index.html";
  }
})();
