// Claves de almacenamiento
const KEY_USUARIOS = "usuarios_upv";
const KEY_SESION   = "upv_sesion";

// Utilidades de usuarios
function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem(KEY_USUARIOS)) || [];
}
function guardarUsuarios(lista) {
  localStorage.setItem(KEY_USUARIOS, JSON.stringify(lista));
}

// Validacion: solo @gmail.com
function esGmailValido(correo) {
  if (!correo) return false;
  // Acepta letras, números y caracteres comunes antes de @, y requiere dominio gmail.com
  const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return regex.test(correo.trim().toLowerCase());
}

// REGISTRO
const registroForm = document.getElementById("registroForm");
if (registroForm) {
  registroForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const correo = document.getElementById("regCorreo").value.trim().toLowerCase();
    const pass = document.getElementById("regPass").value;
    const confirmar = document.getElementById("regConfirmar").value;

    // Validaciones
    if (!correo || !pass || !confirmar) {
      alert("Completa todos los campos.");
      return;
    }
    if (!esGmailValido(correo)) {
      alert("Ingresa un correo válido @gmail.com.");
      return;
    }
    if (pass.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (pass !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const usuarios = obtenerUsuarios();
    const existe = usuarios.find(u => u.correo === correo);
    if (existe) {
      alert("Ese correo ya está registrado.");
      return;
    }

    usuarios.push({ correo, pass });
    guardarUsuarios(usuarios);

    alert("Registro exitoso. Inicia sesión.");
    // Redirige al login
    window.location.href = "index.html";
  });
}

// LOGIN 
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const correo = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pass = document.getElementById("loginPass").value;

    if (!correo || !pass) {
      alert("Completa todos los campos.");
      return;
    }
    if (!esGmailValido(correo)) {
      alert("Ingresa un correo válido @gmail.com.");
      return;
    }

    const usuarios = obtenerUsuarios();
    const user = usuarios.find(u => u.correo === correo && u.pass === pass);

    if (!user) {
      alert("Correo o contraseña incorrectos.");
      return;
    }

    // Guarda sesión y redirige a principal
    localStorage.setItem(KEY_SESION, JSON.stringify({
      correo,
      loginAt: Date.now()
    }));

    window.location.href = "menu.html";
  });
}

// PROTECCIÓN DE PÁGINA PRINCIPAL
(function protegerPrincipal() {
  // Solo corre en principal.html si existen los elementos
  const nombreSpan = document.getElementById("nombreUsuario");
  const btnLogout  = document.getElementById("btnLogout");

  if (!nombreSpan && !btnLogout) return;

  const sesion = JSON.parse(localStorage.getItem(KEY_SESION) || "null");
  if (!sesion || !sesion.correo) {
    // Si no hay sesión, devuelve al login
    window.location.href = "index.html";
    return;
  }

  // Muestra el nombre (parte antes de @)
  nombreSpan.textContent = sesion.correo.split("@")[0];

  // Logout
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem(KEY_SESION);
    window.location.href = "index.html";
  });
})();
