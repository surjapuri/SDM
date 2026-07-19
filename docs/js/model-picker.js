/* ==========================================================================
   MODEL-PICKER.JS
   Shows a proper in-app modal (not a plain browser confirm()) letting the
   user pick which open-source offline AI model to download, with size,
   speed, and quality shown for each so the choice is informed. Only
   shown once per model choice — remembered in localStorage after that.
   ========================================================================== */

window.QRVModelPicker = (function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  function ensureModalExists() {
    if ($("modelPickerModal")) return;
    const wrap = document.createElement("div");
    wrap.id = "modelPickerModal";
    wrap.hidden = true;
    wrap.className = "fixed inset-0 z-50 flex items-end justify-center bg-black/70";
    wrap.innerHTML = `
      <div class="w-full max-w-[480px] max-h-[86vh] overflow-y-auto bg-panel rounded-t-3xl p-6 border-t border-line">
        <h2 class="font-display font-bold text-lg mb-1">Choose your offline AI model</h2>
        <p class="text-xs text-neutral-400 mb-4">All 4 are free, open-source, and run entirely on your device — no internet needed after download, no data ever leaves your phone. Pick based on your device's storage and how fast you want it.</p>
        <div id="modelPickerList" class="space-y-2 mb-4"></div>
        <p class="text-[11px] text-neutral-500 mb-4">Downloads once per model, then cached forever on this device. Wi-Fi recommended.</p>
        <button id="btnModelPickerCancel" type="button" class="w-full py-3 rounded-2xl border border-line text-sm">Cancel</button>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  function renderList(onPick) {
    const list = $("modelPickerList");
    const catalog = window.QRVLocalAI.MODEL_CATALOG;
    list.innerHTML = catalog.map((m) => `
      <button type="button" data-model-id="${m.id}"
        class="w-full text-left rounded-2xl border ${m.recommended ? "border-amber/50 bg-amber/5" : "border-line bg-ink"} p-4">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-sm text-neutral-100">${m.name}</span>
          ${m.recommended ? '<span class="text-[10px] uppercase tracking-wide text-amber font-bold">Recommended</span>' : ""}
        </div>
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-400">
          <span>📦 ${m.size}</span>
          <span>⚡ ${m.speed}</span>
          <span>⭐ ${m.quality} quality</span>
        </div>
        <div class="text-[10px] text-neutral-600 mt-1">${m.license}</div>
      </button>
    `).join("");

    list.querySelectorAll("[data-model-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.QRVLocalAI.setSelectedModel(btn.dataset.modelId);
        $("modelPickerModal").hidden = true;
        onPick(btn.dataset.modelId);
      });
    });
  }

  /**
   * Resolves with the chosen model id, or null if the user cancels.
   * If a model was already chosen previously, resolves immediately
   * without showing the modal again — call `forceReopen()` from a
   * Settings "change AI model" option to let the user switch later.
   */
  function choose({ forceShow } = {}) {
    return new Promise((resolve) => {
      const alreadyChosen = localStorage.getItem("qrv_local_model_choice_v1");
      if (alreadyChosen && !forceShow) {
        resolve(alreadyChosen);
        return;
      }
      ensureModalExists();
      renderList((modelId) => resolve(modelId));
      $("btnModelPickerCancel").onclick = () => {
        $("modelPickerModal").hidden = true;
        resolve(null);
      };
      $("modelPickerModal").hidden = false;
    });
  }

  return { choose };
})();
