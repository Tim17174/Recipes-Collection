function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Wires up the scan/collection/detail tab views and the localStorage-backed
// recipe collection shared by index.html (real camera scan) and
// preview.html (simulated scan). Only the actual scan step differs per page.
function initRecipeUI(storageKey) {
  const preview = document.getElementById("preview");
  const resultEl = document.getElementById("result");
  const collectionList = document.getElementById("collectionList");
  const emptyHint = document.getElementById("emptyHint");
  const detailResult = document.getElementById("detailResult");
  const backBtn = document.getElementById("backBtn");

  const views = {
    scanView: document.getElementById("scanView"),
    collectionView: document.getElementById("collectionView"),
    detailView: document.getElementById("detailView"),
  };
  const tabs = [document.getElementById("tabScan"), document.getElementById("tabCollection")];

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  });
  backBtn.addEventListener("click", () => showView("collectionView"));

  let currentRecipe = null;

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.classList.toggle("active", key === name);
    });
    const tabName = name === "detailView" ? "collectionView" : name;
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === tabName));
  }

  function showDetail(recipe) {
    showView("detailView");
    renderCard(recipe, false, detailResult);
  }

  function renderCard(recipe, withActions, target) {
    const ingredients = (recipe.ingredients || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("");
    const steps = (recipe.instructions || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");
    const meta = [recipe.servings, recipe.time].filter(Boolean).map(escapeHtml).join(" · ");

    target.innerHTML = `
      <div class="card">
        <h2>${escapeHtml(recipe.title || "Ohne Titel")}</h2>
        ${meta ? `<div class="meta">${meta}</div>` : ""}
        ${ingredients ? `<h3>Zutaten</h3><ul>${ingredients}</ul>` : ""}
        ${steps ? `<h3>Zubereitung</h3><ol>${steps}</ol>` : ""}
      </div>
      ${withActions ? `
        <div class="cardActions">
          <button id="saveBtn">Speichern</button>
          <button id="discardBtn">Verwerfen</button>
        </div>` : ""}
    `;

    if (withActions) {
      document.getElementById("saveBtn").addEventListener("click", saveCurrentRecipe);
      document.getElementById("discardBtn").addEventListener("click", () => {
        resultEl.innerHTML = "";
        preview.style.display = "none";
        currentRecipe = null;
      });
    }
  }

  function saveCurrentRecipe() {
    if (!currentRecipe) return;
    const list = loadCollection();
    list.unshift({ ...currentRecipe, savedAt: new Date().toISOString() });
    localStorage.setItem(storageKey, JSON.stringify(list));
    resultEl.innerHTML = "";
    preview.style.display = "none";
    currentRecipe = null;
    renderCollection();
    showView("collectionView");
  }

  function loadCollection() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  }

  function renderCollection() {
    const list = loadCollection();
    emptyHint.style.display = list.length ? "none" : "block";
    collectionList.innerHTML = list.map((r, i) => `
      <div class="collectionItem">
        <div>
          <div class="title">${escapeHtml(r.title || "Ohne Titel")}</div>
          <div class="meta2">${[r.servings, r.time].filter(Boolean).map(escapeHtml).join(" · ")}</div>
        </div>
        <button class="open" data-index="${i}">Öffnen</button>
        <button data-delete="${i}" aria-label="Löschen">✕</button>
      </div>
    `).join("");

    collectionList.querySelectorAll("[data-index]").forEach((btn) => {
      btn.addEventListener("click", () => showDetail(list[Number(btn.dataset.index)]));
    });
    collectionList.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        list.splice(Number(btn.dataset.delete), 1);
        localStorage.setItem(storageKey, JSON.stringify(list));
        renderCollection();
      });
    });
  }

  renderCollection();

  return {
    showView,
    renderCard,
    setCurrentRecipe(recipe) { currentRecipe = recipe; },
  };
}
