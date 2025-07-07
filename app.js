let deferredPrompt;
const installBtn = document.getElementById("installBtn");

// Mostrar botón cuando esté disponible
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

// Botón de instalación (gesto del usuario)
installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();  // ✅ Esto ahora es una user gesture
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Resultado de instalación: ${outcome}`);
    deferredPrompt = null;
    installBtn.hidden = true;
  }
});


window.addEventListener("appinstalled", () => {
  console.log("PWA fue instalada");
});
