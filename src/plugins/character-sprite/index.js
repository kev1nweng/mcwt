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
    const html = `
            <div class="tui-panel">
                <h2>字符纹理生成器</h2>
                <div class="tui-input-group">
                    <label>序列 (要生成的字符)</label>
                    <input type="text" id="sequence" class="tui-input" value="${
                      this.config.sequence
                    }" placeholder="例如：0123456789-:% 或 0,1,2,10,11">
                    <div style="font-size: 10px; color: #999; margin-top: 4px;">提示：使用逗号分隔可在一张图中渲染多个字符（单图多字模式）。</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="tui-input-group">
                        <label>文件名前缀</label>
                        <input type="text" id="filename-prefix" class="tui-input" value="${
                          this.config.prefix
                        }" placeholder="例如：char">
                    </div>
                    <div class="tui-input-group">
                        <label>文件名后缀 (可选)</label>
                        <input type="text" id="filename-suffix" class="tui-input" value="${
                          this.config.suffix
                        }" placeholder="例如：_white">
                    </div>
                </div>
                <div class="tui-input-group">
                    <label>字体系列 (系统字体或 URL)</label>
                    <input type="text" id="font-family" class="tui-input" value="${
                      this.config.fontFamily
                    }" placeholder="例如：'Orbitron' 或 'https://fonts.googleapis.com/css2?family=Orbitron&display=swap'">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="tui-input-group">
                        <label>字体大小 (px)</label>
                        <input type="number" id="font-size" class="tui-input" value="${
                          this.config.fontSize
                        }">
                    </div>
                    <div class="tui-input-group">
                        <label>文本颜色 (十六进制)</label>
                        <input type="color" id="text-color" class="tui-input" value="${
                          this.config.color
                        }" style="height: 40px; padding: 2px;">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="tui-input-group">
                        <label>字符宽度 (px)</label>
                        <input type="number" id="char-width" class="tui-input" value="${
                          this.config.width
                        }">
                    </div>
                    <div class="tui-input-group">
                        <label>字符高度 (px)</label>
                        <input type="number" id="char-height" class="tui-input" value="${
                          this.config.height
                        }">
                    </div>
                </div>
                <div class="tui-input-group">
                    <label>垂直偏移 (px, 可选)</label>
                    <input type="number" id="v-offset" class="tui-input" value="0">
                </div>
                <div class="tui-input-group">
                    <label>字体样式</label>
                    <div class="tui-checkbox-group">
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="style-bold" ${
                              this.config.bold ? "checked" : ""
                            }> <b>B</b> 加粗
                        </label>
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="style-italic" ${
                              this.config.italic ? "checked" : ""
                            }> <i>I</i> 斜体
                        </label>
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="style-underline" ${
                              this.config.underline ? "checked" : ""
                            }> <u>U</u> 下划线
                        </label>
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="style-outline" ${
                              this.config.outlineOnly ? "checked" : ""
                            }> <b>O</b> 仅轮廓
                        </label>
                    </div>
                </div>
                <div class="tui-input-group">
                    <label>字体特性</label>
                    <div class="tui-checkbox-group">
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="feat-tnum" ${this.config.features.tnum ? 'checked' : ''}> 等宽数字 (tnum)
                        </label>
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="feat-lnum" ${this.config.features.lnum ? 'checked' : ''}> 等高数字 (lnum)
                        </label>
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="feat-onum" ${this.config.features.onum ? 'checked' : ''}> 旧式数字 (onum)
                        </label>
                        <label class="tui-checkbox-item">
                            <input type="checkbox" id="feat-kern" ${this.config.features.kern ? 'checked' : ''}> 字距调整 (kern)
                        </label>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <button id="generate-btn" class="tui-button">生成图片</button>
                    <button id="download-btn" class="tui-button secondary" style="margin-left: 10px;">下载 ZIP</button>
                </div>
            </div>
                <div class="tui-panel">
                <h2>预览</h2>
                <div class="sprite-preview-container" id="preview-container" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-start;">
                    <!-- Canvases will be injected here -->
                </div>
            </div>
        `;
    container.innerHTML = html;

    container.querySelector("#generate-btn").onclick = () => this.generate();
    container.querySelector("#download-btn").onclick = () => this.download();

    // Auto-generate on input change
    const inputs = container.querySelectorAll(".tui-input");
    inputs.forEach((input) => {
      input.addEventListener("input", () => this.debouncedGenerate());
    });

    const checkboxes = container.querySelectorAll(".tui-checkbox-group input");
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => this.debouncedGenerate());
    });

    this.previewContainer = container.querySelector("#preview-container");
    setTimeout(() => this.generate(), 0);
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
        '<p style="color: var(--secondary-text);">输入序列以生成图片。</p>';
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
      wrapper.style.textAlign = "center";

      const canvas = document.createElement("canvas");
      canvas.width = this.config.width;
      canvas.height = this.config.height;

      wrapper.appendChild(canvas);
      const label = document.createElement("div");
      label.style.fontSize = "10px";
      label.style.color = "#999";
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
                        style='font-feature-settings: ${featureSettings}; font-variant-numeric: ${variantNumeric};'
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
