import JSZip from "jszip";

export class CharacterSpritePlugin {
  constructor() {
    this.name = "字符纹理生成器";
    this.config = {
      fontFamily: "Inter",
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
          <h2 class="${h2Class}">字符纹理生成器</h2>
          <div class="${groupClass}">
            <label class="${labelClass}">序列 (要生成的字符)</label>
            <input type="text" id="sequence" class="${inputClass}" data-autogen="input" value="${
                      this.config.sequence
                    }" placeholder="例如：0123456789-:% 或 0,1,2,10,11">
            <div class="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">提示：使用逗号分隔可在一张图中渲染多个字符（单图多字模式）。</div>
                </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">文件名前缀</label>
              <input type="text" id="filename-prefix" class="${inputClass}" data-autogen="input" value="${
                          this.config.prefix
                        }" placeholder="例如：char">
                    </div>
            <div class="${groupClass}">
              <label class="${labelClass}">文件名后缀 (可选)</label>
              <input type="text" id="filename-suffix" class="${inputClass}" data-autogen="input" value="${
                          this.config.suffix
                        }" placeholder="例如：_white">
                    </div>
                </div>
          <div class="${groupClass}">
            <label class="${labelClass}">字体系列 (系统字体或 URL)</label>
            <input type="text" id="font-family" class="${inputClass}" data-autogen="input" value="${
                      this.config.fontFamily
                    }" placeholder="例如：'Orbitron' 或 'https://fonts.googleapis.com/css2?family=Orbitron&display=swap'">
                </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">字体大小 (px)</label>
              <input type="number" id="font-size" class="${inputClass}" data-autogen="input" value="${
                          this.config.fontSize
                        }">
                    </div>
            <div class="${groupClass}">
              <label class="${labelClass}">文本颜色 (十六进制)</label>
                        <input type="color" id="text-color" class="h-10 w-full cursor-pointer rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-1" data-autogen="input" value="${
                          this.config.color
              }">
                    </div>
                </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">字符宽度 (px)</label>
              <input type="number" id="char-width" class="${inputClass}" data-autogen="input" value="${
                          this.config.width
                        }">
                    </div>
            <div class="${groupClass}">
              <label class="${labelClass}">字符高度 (px)</label>
              <input type="number" id="char-height" class="${inputClass}" data-autogen="input" value="${
                          this.config.height
                        }">
                    </div>
                </div>
          <div class="${groupClass}">
            <label class="${labelClass}">垂直偏移 (px, 可选)</label>
            <input type="number" id="v-offset" class="${inputClass}" data-autogen="input" value="0">
                </div>
          <div class="${groupClass}">
            <label class="${labelClass}">字体样式</label>
            <div class="${checkboxWrapClass}">
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-bold" data-autogen="change" ${
                              this.config.bold ? "checked" : ""
                            }> <b>B</b> 加粗
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-italic" data-autogen="change" ${
                              this.config.italic ? "checked" : ""
                            }> <i>I</i> 斜体
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-underline" data-autogen="change" ${
                              this.config.underline ? "checked" : ""
                            }> <u>U</u> 下划线
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="style-outline" data-autogen="change" ${
                              this.config.outlineOnly ? "checked" : ""
                            }> <b>O</b> 仅轮廓
                        </label>
                    </div>
                </div>
          <div class="${groupClass}">
            <label class="${labelClass}">字体特性</label>
            <div class="${checkboxWrapClass}">
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-tnum" data-autogen="change" ${this.config.features.tnum ? 'checked' : ''}> 等宽数字 (tnum)
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-lnum" data-autogen="change" ${this.config.features.lnum ? 'checked' : ''}> 等高数字 (lnum)
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-onum" data-autogen="change" ${this.config.features.onum ? 'checked' : ''}> 旧式数字 (onum)
                        </label>
              <label class="${checkboxItemClass}">
                <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="feat-kern" data-autogen="change" ${this.config.features.kern ? 'checked' : ''}> 字距调整 (kern)
                        </label>
                    </div>
                </div>
          <div class="${groupClass}">
            <label class="${checkboxItemClass} mb-2">
              <input class="accent-[hsl(var(--foreground))]" type="checkbox" id="enable-variable-font" ${this.config.enableVariableFont ? 'checked' : ''}> 
              <span class="font-medium">启用可变字体控制</span>
                    </label>
            <div class="ml-5 mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        如果字体支持可变轴（如 wght, wdth, opsz 等），勾选此项以显示控制选项
                    </div>
                </div>
          <div id="variable-font-controls" class="${groupClass} hidden">
            <label class="${labelClass}">可变字体轴控制</label>
            <div id="variation-axes-container" class="mt-3 flex flex-col gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
                        <!-- Variable font axes will be dynamically added here -->
                    </div>
                </div>
          <div class="mt-3 flex flex-wrap gap-3">
            <button id="generate-btn" class="${primaryBtnClass}">生成图片</button>
            <button id="download-btn" class="${secondaryBtnClass}">下载 ZIP</button>
                </div>
            </div>
              <div class="${panelClass}">
          <h2 class="${h2Class}">预览</h2>
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
      { tag: 'wght', name: '字重 (Weight)', min: 100, max: 1000, default: 400 },
      { tag: 'wdth', name: '宽度 (Width)', min: 25, max: 200, default: 100 },
      { tag: 'opsz', name: '光学尺寸 (Optical Size)', min: 6, max: 144, default: 14 },
      { tag: 'slnt', name: '倾斜 (Slant)', min: -15, max: 0, default: 0 },
      { tag: 'ital', name: '斜体 (Italic)', min: 0, max: 1, default: 0 },
      { tag: 'GRAD', name: '笔画 (Grade)', min: -200, max: 150, default: 0 },
      // Google Sans Flex supports Roundness axis
      { tag: 'ROND', name: '圆角 (Roundness)', min: 0, max: 100, default: 0 },
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
    const vOffset = parseInt(document.getElementById("v-offset").value) || 0;

    this.config.bold = document.getElementById("style-bold").checked;
    this.config.italic = document.getElementById("style-italic").checked;
    this.config.underline = document.getElementById("style-underline").checked;
    this.config.outlineOnly = document.getElementById("style-outline").checked;

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
        '<p class="text-sm text-[hsl(var(--muted-foreground))]">输入序列以生成图片。</p>';
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
      label.textContent = item === " " ? "空格" : item;
      wrapper.appendChild(label);
      this.previewContainer.appendChild(wrapper);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fontWeight = this.config.bold ? "bold" : "normal";
      const fontStyle = this.config.italic ? "italic" : "normal";
      const textDecoration = this.config.underline ? "underline" : "none";
      const fill = this.config.outlineOnly ? "none" : this.config.color;
      const stroke = this.config.outlineOnly ? this.config.color : "none";
      const strokeWidth = this.config.outlineOnly ? "2" : "0"; // Using 2px for better visibility of outline

      // Build font-variation-settings from detected axes
      let fontVariationSettings = 'normal';
      if (Object.keys(this.config.variationSettings).length > 0) {
        fontVariationSettings = Object.entries(this.config.variationSettings)
          .map(([tag, value]) => `"${tag}" ${value}`)
          .join(', ');
      }

      // Use SVG to render text to ensure font features (tnum, etc.) are respected
      // Canvas 2D API has inconsistent support for font-feature-settings across browsers
      const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${
                  this.config.width
                }" height="${this.config.height}">
                    <text 
                        x="${this.config.width / 2}" 
                        y="${commonY}" 
                        font-family="${this.escapeXml(this.config.fontFamily)}" 
                        font-size="${this.config.fontSize}px" 
                        font-weight="${fontWeight}"
                        font-style="${fontStyle}"
                        text-decoration="${textDecoration}"
                        fill="${fill}" 
                        stroke="${stroke}"
                        stroke-width="${strokeWidth}"
                        text-anchor="middle" 
                        dominant-baseline="alphabetic"
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
