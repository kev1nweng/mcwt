import JSZip from "jszip";
import { createI18n } from "../../utils/i18n.js";
import { translations } from "./locales.js";

export class CharacterSpritePlugin {
  constructor() {
    const { t } = createI18n(translations);
    this.t = t;
    this.name = t("name");
    this.config = {
      fontFamily:
        "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap",
      fontSize: 48,
      color: "#ffffff",
      width: 40,
      height: 60,
      sequence: "0123456789-",
      prefix: "char",
      suffix: "",
      bold: false,
      italic: false,
      underline: false,
      outlineOnly: false,
      outlineThickness: 1.2,
      features: {
        tnum: true,
        lnum: false,
        onum: false,
        kern: true,
      },
      enableVariableFont: false, // Manual toggle for variable font controls
      variationSettings: {}, // Store variable font axis values
    };
    this.generatedImages = []; // Store individual canvases
    this.debouncedGenerate = this.debounce(() => this.generate(), 100);
  }

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  escapeXml(unsafe) {
    return unsafe.replace(/[<>&"']/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case '"':
          return "&quot;";
        case "'":
          return "&apos;";
      }
    });
  }

  render(container) {
    const inputClass =
      "w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--ring))] focus:ring-4 focus:ring-[hsl(var(--ring)/0.18)]";
    const labelClass = "mb-2 block text-sm font-medium";
    const groupClass = "mb-5";
    const panelClass =
      "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))] shadow-sm";
    const h2Class = "mb-5 text-base font-semibold tracking-tight";
    const checkboxWrapClass = "mt-2 flex flex-wrap gap-4";
    const checkboxItemClass =
      "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition hover:bg-[hsl(var(--muted))] active:scale-[0.99] focus-within:outline-none focus-within:ring-4 focus-within:ring-[hsl(var(--ring)/0.18)]";
    const buttonBaseClass =
      "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring)/0.18)]";
    const primaryBtnClass = `${buttonBaseClass} border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:brightness-[0.96]`;
    const secondaryBtnClass = `${buttonBaseClass} border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]`;

    const html = `
      <div class="space-y-6">
        <div class="${panelClass}">
          <h2 class="${h2Class}">${this.t("name")}</h2>
          <div class="${groupClass}">
            <label class="${labelClass}">${this.t("sequence")}</label>
            <input type="text" id="sequence" class="${inputClass}" data-autogen="input" value="${
                      this.config.sequence
                    }" placeholder="${this.t("sequence_placeholder")}">
            <div class="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">${this.t("sequence_tip")}</div>
                </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("prefix")}</label>
              <input type="text" id="filename-prefix" class="${inputClass}" data-autogen="input" value="${
                          this.config.prefix
                        }" placeholder="${this.t("prefix_placeholder")}">
                    </div>
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("suffix")}</label>
              <input type="text" id="filename-suffix" class="${inputClass}" data-autogen="input" value="${
                          this.config.suffix
                        }" placeholder="${this.t("suffix_placeholder")}">
                    </div>
                </div>
          <div class="${groupClass}">
            <label class="${labelClass}">${this.t("font_family")}</label>
            <input type="text" id="font-family" class="${inputClass}" data-autogen="input" value="${
                      this.config.fontFamily
                    }" placeholder="${this.t("font_family_placeholder")}">
                </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("font_size")}</label>
              <input type="number" id="font-size" class="${inputClass}" data-autogen="input" value="${
                          this.config.fontSize
                        }">
                    </div>
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("text_color")}</label>
                        <input type="color" id="text-color" class="h-10 w-full cursor-pointer rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-1" data-autogen="input" value="${
                          this.config.color
              }">
                    </div>
                </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("width")}</label>
              <input type="number" id="char-width" class="${inputClass}" data-autogen="input" value="${
                          this.config.width
                        }">
                    </div>
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("height")}</label>
              <input type="number" id="char-height" class="${inputClass}" data-autogen="input" value="${
                          this.config.height
                        }">
                    </div>
                </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("h_offset")}</label>
              <input type="number" id="h-offset" class="${inputClass}" data-autogen="input" value="0">
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("v_offset")}</label>
              <input type="number" id="v-offset" class="${inputClass}" data-autogen="input" value="0">
            </div>
          </div>
          <div class="${groupClass}">
            <label class="${labelClass}">${this.t("font_style")}</label>
            <div class="${checkboxWrapClass} items-center">
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-bold" data-autogen="change" ${
                              this.config.bold ? "checked" : ""
                            }> <b>B</b> ${this.t("bold")}
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-italic" data-autogen="change" ${
                              this.config.italic ? "checked" : ""
                            }> <i>I</i> ${this.t("italic")}
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-underline" data-autogen="change" ${
                              this.config.underline ? "checked" : ""
                            }> <u>U</u> ${this.t("underline")}
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-outline" data-autogen="change" ${
                              this.config.outlineOnly ? "checked" : ""
                            }> <b>O</b> ${this.t("outline_only")}
                        </label>

              <div id="outline-thickness-group" class="flex flex-1 items-center gap-2.5 min-w-[140px] ${this.config.outlineOnly ? "" : "hidden"}">
                <span class="whitespace-nowrap text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">${this.t("outline_thickness")}</span>
                <input type="range" id="outline-thickness" class="variation-slider flex-1" min="0.1" max="10" step="0.1" value="${this.config.outlineThickness}" data-autogen="input">
                <span id="outline-thickness-value" class="w-7 font-mono text-[10px] text-[hsl(var(--muted-foreground))] text-right">${this.config.outlineThickness}</span>
              </div>
            </div>
          </div>
          <div class="${groupClass}">
            <label class="${labelClass}">${this.t("font_features")}</label>
            <div class="${checkboxWrapClass}">
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-tnum" data-autogen="change" ${this.config.features.tnum ? 'checked' : ''}> ${this.t("tnum")}
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-lnum" data-autogen="change" ${this.config.features.lnum ? 'checked' : ''}> ${this.t("lnum")}
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-onum" data-autogen="change" ${this.config.features.onum ? 'checked' : ''}> ${this.t("onum")}
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-kern" data-autogen="change" ${this.config.features.kern ? 'checked' : ''}> ${this.t("kern")}
                        </label>
                    </div>
                </div>
          <div class="${groupClass}">
            <label class="${checkboxItemClass} mb-2">
              <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="enable-variable-font" ${this.config.enableVariableFont ? 'checked' : ''}> 
              <span class="font-medium">${this.t("enable_variable_font")}</span>
                    </label>
            <div class="ml-5 mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        ${this.t("variable_font_tip")}
                    </div>
                </div>
          <div id="variable-font-controls" class="${groupClass} hidden">
            <label class="${labelClass}">${this.t("variable_font_axes")}</label>
            <div id="variation-axes-container" class="mt-3 flex flex-col gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
                        <!-- Variable font axes will be dynamically added here -->
                    </div>
                </div>
          <div class="mt-3 flex flex-wrap gap-3">
            <button id="download-btn" class="${primaryBtnClass}">${this.t("download_zip_btn")}</button>
            <button id="generate-btn" class="${secondaryBtnClass}">${this.t("refresh_preview_btn")}</button>
          </div>
            </div>
              <div class="${panelClass}">
          <h2 class="${h2Class}">${this.t("preview_area")}</h2>
          <div id="preview-container" class="mt-3 flex flex-wrap gap-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
                    <!-- Canvases will be injected here -->
                </div>
            </div>
          </div>
        `;

    container.innerHTML = html;

    container.querySelector("#generate-btn").onclick = () => this.generate();
    container.querySelector("#download-btn").onclick = () => this.download();

    // Auto-generate on input change
    const autogens = container.querySelectorAll("[data-autogen]");
    autogens.forEach((el) => {
      const mode = el.getAttribute("data-autogen");
      const evt = mode === "change" ? "change" : "input";
      el.addEventListener(evt, () => this.debouncedGenerate());
    });

    // Variable font toggle
    const variableFontToggle = container.querySelector("#enable-variable-font");
    variableFontToggle.addEventListener("change", (e) => {
      this.config.enableVariableFont = e.target.checked;
      this.updateVariableControls();
    });

    // Outline thickness toggle & value update
    const outlineToggle = container.querySelector("#style-outline");
    const thicknessGroup = container.querySelector("#outline-thickness-group");
    const thicknessInput = container.querySelector("#outline-thickness");
    const thicknessValue = container.querySelector("#outline-thickness-value");

    outlineToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        thicknessGroup.classList.remove("hidden");
      } else {
        thicknessGroup.classList.add("hidden");
      }
    });

    thicknessInput.addEventListener("input", (e) => {
      thicknessValue.textContent = e.target.value;
    });

    this.previewContainer = container.querySelector("#preview-container");
    setTimeout(() => {
      this.updateVariableControls();
      this.generate();
    }, 0);
  }

  updateVariableControls() {
    const variableControlsDiv = document.getElementById("variable-font-controls");
    const axesContainer = document.getElementById("variation-axes-container");
    
    if (!variableControlsDiv || !axesContainer) return;

    if (!this.config.enableVariableFont) {
      variableControlsDiv.classList.add("hidden");
      return;
    }

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const getAxisStep = (axis) => {
      if (axis.tag === "ital") return 1;
      const raw = (axis.max - axis.min) / 100;
      // Keep it usable for small ranges while not being too granular for large ones
      return Number(Math.max(0.1, raw).toFixed(2));
    };
    const normalizeAxisValue = (axis, value) => {
      let next = Number(value);
      if (Number.isNaN(next)) return undefined;
      const axisStep = getAxisStep(axis);
      if (axis.tag === "ital") {
        next = next >= 0.5 ? 1 : 0;
      } else {
        // Snap to step, avoid float drift
        next = Number((Math.round(next / axisStep) * axisStep).toFixed(4));
      }
      return clamp(next, axis.min, axis.max);
    };
    const formatAxisValue = (axis, value) => {
      if (axis.tag === "ital") return String(Math.round(value));
      // Prefer showing up to 2 decimals, but trim trailing zeros
      const step = getAxisStep(axis);
      const decimals = step < 1 ? 2 : 1;
      const fixed = Number(value).toFixed(decimals);
      return fixed.replace(/\.0+$|(?<=\.[0-9]*)0+$/g, "");
    };

    // Common variable font axes with their ranges
    const commonAxes = [
      { tag: 'wght', name: this.t('weight'), min: 100, max: 1000, default: 400 },
      { tag: 'wdth', name: this.t('wdth'), min: 25, max: 200, default: 100 },
      { tag: 'opsz', name: this.t('opsz'), min: 6, max: 144, default: 14 },
      { tag: 'slnt', name: this.t('slnt'), min: -15, max: 0, default: 0 },
      { tag: 'ital', name: this.t('ital'), min: 0, max: 1, default: 0 },
      { tag: 'GRAD', name: this.t('grad'), min: -200, max: 150, default: 0 },
      // Google Sans Flex supports Roundness axis
      { tag: 'ROND', name: this.t('rond'), min: 0, max: 100, default: 0 },
    ];

    variableControlsDiv.classList.remove("hidden");
    axesContainer.innerHTML = "";

    commonAxes.forEach(axis => {
      const axisStep = getAxisStep(axis);
      const currentValueRaw =
        this.config.variationSettings[axis.tag] !== undefined
          ? this.config.variationSettings[axis.tag]
          : axis.default;
      const normalized = normalizeAxisValue(axis, currentValueRaw);
      const currentValue = normalized === undefined
        ? clamp(Number(axis.default), axis.min, axis.max)
        : normalized;

      const axisControl = document.createElement("div");
      axisControl.className = "space-y-2";
      axisControl.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <label class="text-[13px] font-medium">${axis.name}</label>
          <div class="inline-flex items-center gap-2">
            <span id="valuewrap-${axis.tag}"></span>
            <button type="button" id="reset-${axis.tag}" class="inline-flex h-6 w-7 items-center justify-center rounded-md border border-transparent text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--background))] hover:text-[hsl(var(--foreground))] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring)/0.18)] active:scale-[0.98]" title="恢复默认值">↺</button>
          </div>
        </div>
        <input 
          type="range" 
          id="axis-${axis.tag}" 
          class="variation-slider w-full"
          min="${axis.min}" 
          max="${axis.max}" 
          value="${currentValue}"
          step="${axisStep}"
        >
      `;
      axesContainer.appendChild(axisControl);

      const slider = axisControl.querySelector(`#axis-${axis.tag}`);
      const valueWrap = axisControl.querySelector(`#valuewrap-${axis.tag}`);
      const resetBtn = axisControl.querySelector(`#reset-${axis.tag}`);

      const renderValueButton = (value) => {
        valueWrap.innerHTML = '';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rounded-md border border-transparent px-1.5 py-0.5 font-mono text-xs text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--background))] hover:text-[hsl(var(--foreground))]';
        btn.textContent = formatAxisValue(axis, value);
        btn.title = '点击编辑';
        btn.addEventListener('click', () => {
          // Swap to inline number editor
          valueWrap.innerHTML = '';
          const input = document.createElement('input');
          input.type = 'number';
          input.className = 'w-24 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 py-1 font-mono text-xs text-[hsl(var(--foreground))] shadow-sm outline-none focus:border-[hsl(var(--ring))] focus:ring-4 focus:ring-[hsl(var(--ring)/0.18)]';
          input.min = String(axis.min);
          input.max = String(axis.max);
          input.step = String(axisStep);
          input.value = String(Number(value));
          valueWrap.appendChild(input);
          input.focus();
          input.select();

          const cancel = () => {
            renderValueButton(Number(slider.value));
          };

          const commit = () => {
            let next = Number.parseFloat(input.value);
            if (Number.isNaN(next)) {
              cancel();
              return;
            }

            next = normalizeAxisValue(axis, next);
            if (next === undefined) {
              cancel();
              return;
            }

            this.config.variationSettings[axis.tag] = next;
            slider.value = String(next);
            renderValueButton(next);
            this.debouncedGenerate();
          };

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          });
          input.addEventListener('blur', () => commit());
        });
        valueWrap.appendChild(btn);
      };

      renderValueButton(currentValue);
      // Ensure config is in sync if user toggles control on later
      this.config.variationSettings[axis.tag] = currentValue;

      resetBtn.addEventListener('click', () => {
        const next = normalizeAxisValue(axis, axis.default);
        if (next === undefined) return;
        this.config.variationSettings[axis.tag] = next;
        slider.value = String(next);
        renderValueButton(next);
        this.debouncedGenerate();
      });
      
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.config.variationSettings[axis.tag] = value;
        // Don't fight the user while they're typing
        const activeEl = document.activeElement;
        const isEditing = activeEl && valueWrap.contains(activeEl) && activeEl.tagName === 'INPUT';
        if (!isEditing) {
          renderValueButton(value);
        }
        this.debouncedGenerate();
      });
    });
  }

  async generate() {
    const fontFamilyInput = document.getElementById("font-family").value;
    this.config.sequence = document.getElementById("sequence").value;
    this.config.prefix = document.getElementById("filename-prefix").value || "char";
    this.config.suffix = document.getElementById("filename-suffix").value;
    this.config.fontSize = parseInt(document.getElementById("font-size").value);
    this.config.width = parseInt(document.getElementById("char-width").value);
    this.config.height = parseInt(document.getElementById("char-height").value);
    this.config.color = document.getElementById("text-color").value;
    const hOffset = parseInt(document.getElementById("h-offset").value) || 0;
    const vOffset = parseInt(document.getElementById("v-offset").value) || 0;

    this.config.bold = document.getElementById("style-bold").checked;
    this.config.italic = document.getElementById("style-italic").checked;
    this.config.underline = document.getElementById("style-underline").checked;
    this.config.outlineOnly = document.getElementById("style-outline").checked;
    this.config.outlineThickness = parseFloat(
      document.getElementById("outline-thickness").value
    );

    // Font Features
    const features = [];
    let variantNumeric = "normal";
    if (document.getElementById("feat-tnum").checked) {
      features.push('"tnum" 1');
      variantNumeric = "tabular-nums";
    }
    if (document.getElementById("feat-lnum").checked) features.push('"lnum" 1');
    if (document.getElementById("feat-onum").checked) features.push('"onum" 1');
    if (document.getElementById("feat-kern").checked) features.push('"kern" 1');
    const featureSettings = features.join(", ") || "normal";

    // Handle Font URL
    if (fontFamilyInput.startsWith("http")) {
      const linkId = "custom-font-link";
      let link = document.getElementById(linkId);
      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = fontFamilyInput;

      const match = fontFamilyInput.match(/family=([^&:]+)/);
      if (match) {
        this.config.fontFamily = match[1].replace(/\+/g, " ");
      }

      try {
        await document.fonts.load(
          `${this.config.fontSize}px "${this.config.fontFamily}"`
        );
        await document.fonts.ready;
      } catch (e) {
        console.warn("字体加载失败，回退到系统字体");
      }
    } else {
      this.config.fontFamily = fontFamilyInput;
    }

    const sequenceInput = this.config.sequence;
    let items;
    if (sequenceInput.includes(",")) {
      items = sequenceInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      items = sequenceInput.split("");
    }

    if (items.length === 0) {
      this.previewContainer.innerHTML =
        `<p class="text-sm text-[hsl(var(--muted-foreground))]">${this.t("input_sequence_tip")}</p>`;
      return;
    }


    // 1. Pre-measure all characters to find a common baseline
    const tempCanvas = document.createElement("canvas");
    // Attach temp canvas to DOM to ensure font features are active during measurement
    tempCanvas.style.position = "absolute";
    tempCanvas.style.visibility = "hidden";
    tempCanvas.style.fontFeatureSettings = featureSettings;
    tempCanvas.style.fontVariantNumeric = variantNumeric;
    document.body.appendChild(tempCanvas);

    const tempCtx = tempCanvas.getContext("2d");
    if ("fontVariantNumeric" in tempCtx) {
      tempCtx.fontVariantNumeric = variantNumeric;
    }
    const fontStylePrefix = `${this.config.italic ? "italic " : ""}${
      this.config.bold ? "bold " : ""
    }`;
    tempCtx.font = `${fontStylePrefix}${this.config.fontSize}px "${this.config.fontFamily}"`;

    let maxAscent = 0;
    let maxDescent = 0;

    items.forEach((item) => {
      const metrics = tempCtx.measureText(item);
      maxAscent = Math.max(maxAscent, metrics.actualBoundingBoxAscent);
      maxDescent = Math.max(maxDescent, metrics.actualBoundingBoxDescent);
    });

    const totalMaxHeight = maxAscent + maxDescent;
    // Calculate a common Y that centers the "tallest" character set
    const commonY =
      (this.config.height - totalMaxHeight) / 2 + maxAscent + vOffset;

    document.body.removeChild(tempCanvas);

    // 2. Generate images
    this.generatedImages = [];
    this.previewContainer.innerHTML = "";

    for (const [index, item] of items.entries()) {
      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center gap-1 text-center";

      const canvas = document.createElement("canvas");
      canvas.width = this.config.width;
      canvas.height = this.config.height;

      wrapper.appendChild(canvas);
      const label = document.createElement("div");
      label.className = "text-[10px] text-[hsl(var(--muted-foreground))]";
      label.textContent = item === " " ? this.t("space") : item;
      wrapper.appendChild(label);

      this.previewContainer.appendChild(wrapper);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fontWeight = this.config.bold ? "bold" : "normal";
      const fontStyle = this.config.italic ? "italic" : "normal";
      const textDecoration = this.config.underline ? "underline" : "none";

      // Build font-variation-settings from detected axes
      let fontVariationSettings = "normal";
      if (Object.keys(this.config.variationSettings).length > 0) {
        fontVariationSettings = Object.entries(this.config.variationSettings)
          .map(([tag, value]) => `"${tag}" ${value}`)
          .join(", ");
      }

      // Use SVG filter for outline to avoid internal lines from overlapping font paths
      const outlineFilter = this.config.outlineOnly
        ? `
        <defs>
          <filter id="outline">
            <feMorphology operator="dilate" radius="${this.config.outlineThickness}" in="SourceAlpha" result="dilated"/>
            <feComposite operator="out" in="dilated" in2="SourceAlpha" result="outline"/>
            <feFlood flood-color="${this.config.color}" result="color"/>
            <feComposite operator="in" in="color" in2="outline"/>
          </filter>
        </defs>`
        : "";

      // Use SVG to render text to ensure font features (tnum, etc.) are respected
      // Canvas 2D API has inconsistent support for font-feature-settings across browsers
      const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${this.config.width}" height="${this.config.height}">
                    ${outlineFilter}
                    <text 
                        x="${this.config.width / 2 + hOffset}" 
                        y="${commonY}" 
                        font-family="${this.escapeXml(this.config.fontFamily)}" 
                        font-size="${this.config.fontSize}px" 
                        font-weight="${fontWeight}"
                        font-style="${fontStyle}"
                        text-decoration="${textDecoration}"
                        fill="${this.config.color}" 
                        text-anchor="middle" 
                        dominant-baseline="alphabetic"
                        ${this.config.outlineOnly ? 'filter="url(#outline)"' : ""}
                        style='font-feature-settings: ${featureSettings}; font-variant-numeric: ${variantNumeric}; font-variation-settings: ${fontVariationSettings};'
                    >${this.escapeXml(item)}</text>
                </svg>
            `;

      const img = new Image();
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });

      this.generatedImages.push({
        char: item,
        index: index,
        canvas: canvas,
      });
    }
  }

  async download() {
    if (this.generatedImages.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("watchface_assets");

    for (const item of this.generatedImages) {
      const dataUrl = item.canvas.toDataURL("image/png");
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      // Use prefix, index and suffix to avoid filename collisions
      const filename = `${this.config.prefix}_${item.index}${this.config.suffix}.png`;
      folder.file(filename, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `miband_assets_${Date.now()}.zip`;
    link.click();
  }

  destroy() {}
}
