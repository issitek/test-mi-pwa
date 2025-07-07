// =================== IndexedDB ===================
let db;
const request = indexedDB.open("taskDB", 1);
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  loadTasks();
};

function addTaskToDB(task) {
  const tx = db.transaction("tasks", "readwrite");
  tx.objectStore("tasks").add({ text: task });
}

function deleteTaskFromDB(id) {
  const tx = db.transaction("tasks", "readwrite");
  tx.objectStore("tasks").delete(id);
}

function loadTasks() {
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const request = store.openCursor();
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const li = document.createElement("li");
      li.textContent = cursor.value.text;

      const btn = document.createElement("button");
      btn.textContent = "❌";
      btn.classList.add("deleteBtn");
      btn.onclick = () => {
        deleteTaskFromDB(cursor.key);
        loadTasks();
      };

      li.appendChild(btn);
      list.appendChild(li);
      cursor.continue();
    }
  };
}

// =================== UI Logic ===================
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();
  if (task) {
    addTaskToDB(task);
    loadTasks();
    input.value = "";
  }
});

// =================== PWA Install Logic ===================
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Resultado de instalación: ${outcome}`);
    deferredPrompt = null;
    installBtn.hidden = true;
  }
});

window.addEventListener("appinstalled", () => {
  console.log("PWA instalada");
});


// =================== Estado de Conexión ===================
function updateConnectionStatus() {
  const indicator = document.getElementById("status-indicator");
  if (navigator.onLine) {
    indicator.style.backgroundColor = "green";
  } else {
    indicator.style.backgroundColor = "red";
  }
}

// Inicializar al cargar
window.addEventListener("load", updateConnectionStatus);
// Escuchar cambios de red
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

// =================== Registro de Service Worker ===================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(reg => {
        console.log('[SW] ✅ Registrado con éxito:', reg.scope);
      })
      .catch(err => {
        console.error('[SW] ❌ Error al registrar:', err);
      });
  });
}
