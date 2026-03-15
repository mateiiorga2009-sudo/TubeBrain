const ideaInput = document.getElementById("idea");
const generateBtn = document.getElementById("generateBtn");
const resultsSection = document.getElementById("results");
const titlesList = document.getElementById("titlesList");
const thumbnailsList = document.getElementById("thumbnailsList");
const hookText = document.getElementById("hookText");
const structureList = document.getElementById("structureList");
const statusBox = document.getElementById("status");

const BACKEND_URL = "http://localhost:3000/generate";

function setStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = "status";
  if (type) statusBox.classList.add(type);
}

function clearResults() {
  titlesList.innerHTML = "";
  thumbnailsList.innerHTML = "";
  hookText.textContent = "";
  structureList.innerHTML = "";
}

generateBtn.addEventListener("click", async () => {
  const idea = ideaInput.value.trim();

  if (!idea) {
    setStatus("Escribe primero una idea de video.", "error");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generando...";
  setStatus("Hablando con la IA, esto puede tardar unos segundos...");
  clearResults();
  resultsSection.classList.add("hidden");

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al llamar al backend.");
    }

    const data = await response.json();
    const { titles = [], thumbnails = [], hook = "", structure = [] } = data;

    titles.forEach((title) => {
      const li = document.createElement("li");
      li.textContent = title;
      titlesList.appendChild(li);
    });

    thumbnails.forEach((thumb) => {
      const li = document.createElement("li");
      li.textContent = thumb;
      thumbnailsList.appendChild(li);
    });

    hookText.textContent = hook;

    (structure || []).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      structureList.appendChild(li);
    });

    resultsSection.classList.remove("hidden");
    setStatus("Contenido generado correctamente.", "success");
  } catch (err) {
    console.error(err);
    setStatus(
      err.message ||
        "Hubo un problema al generar el contenido. Revisa que el backend esté encendido.",
      "error"
    );
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generar contenido";
  }
});

