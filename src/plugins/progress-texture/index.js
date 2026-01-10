import JSZip from "jszip";

export class ProgressTexturePlugin {
  constructor() {
    this.name = "进度纹理生成器";
    this.config = {
      style: "arc", // arc, circle, line
      width: 100,
      height: 100,
      centerX: 50,
      centerY: 50,
      radius: 40,
      thickness: 10,
      startAngle: -90, // degrees
      endAngle: 270,   // degrees
      steps: 10,       // 0 to 100 in 10 steps
      color: "#ff0000",
      bgColor: "rgba(255, 255, 255, 0.1)",
      fillType: "solid", // solid, gradient
      gradientColor: "#00ff00",
      lineCap: "round", // round, butt, square
      startX: 10,
      startY: 50,
      endX: 90,
      endY: 50,
      prefix: "progress",
      suffix: "",
    };
    this.generatedImages = [];
    this.debouncedGenerate = this.debounce(() => this.generate(), 100);
  }

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  render(container) {
    const inputClass =
      "w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--ring))] focus:ring-4 focus:ring-[hsl(var(--ring)/0.18)]";
    const labelClass = "mb-2 block text-sm font-medium";
    const groupClass = "mb-5";
    const panelClass =
      "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))] shadow-sm";
    const h2Class = "mb-5 text-base font-semibold tracking-tight";
    const buttonBaseClass =
      "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring)/0.18)]";
    const primaryBtnClass = `${buttonBaseClass} border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:brightness-[0.96]`;
    const secondaryBtnClass = `${buttonBaseClass} border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]`;

    const html = `
      <div class="space-y-6">
        <div class="${panelClass}">
          <h2 class="${h2Class}">进度纹理生成器</h2>
          
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">样式</label>
              <select id="style" class="${inputClass}" data-autogen="change">
                <option value="arc" ${this.config.style === "arc" ? "selected" : ""}>圆环/圆弧</option>
                <option value="circle" ${this.config.style === "circle" ? "selected" : ""}>实心圆</option>
                <option value="line" ${this.config.style === "line" ? "selected" : ""}>线条</option>
              </select>
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">总步数 (序列长度)</label>
              <input type="number" id="steps" class="${inputClass}" data-autogen="input" value="${this.config.steps}">
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">画布宽度</label>
              <input type="number" id="width" class="${inputClass}" data-autogen="input" value="${this.config.width}">
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">画布高度</label>
              <input type="number" id="height" class="${inputClass}" data-autogen="input" value="${this.config.height}">
            </div>
          </div>

          <div id="arc-params" class="${this.config.style === "arc" ? "" : "hidden"}">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">圆心 X</label>
                <input type="number" id="centerX" class="${inputClass}" data-autogen="input" value="${this.config.centerX}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">圆心 Y</label>
                <input type="number" id="centerY" class="${inputClass}" data-autogen="input" value="${this.config.centerY}">
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div class="${groupClass}">
                <label class="${labelClass}">半径</label>
                <input type="number" id="radius" class="${inputClass}" data-autogen="input" value="${this.config.radius}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">粗细</label>
                <input type="number" id="thickness" class="${inputClass}" data-autogen="input" value="${this.config.thickness}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">线头样式</label>
                <select id="lineCap" class="${inputClass}" data-autogen="change">
                  <option value="round" ${this.config.lineCap === "round" ? "selected" : ""}>圆头</option>
                  <option value="butt" ${this.config.lineCap === "butt" ? "selected" : ""}>平头</option>
                  <option value="square" ${this.config.lineCap === "square" ? "selected" : ""}>方头</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">起始角度 (度)</label>
                <input type="number" id="startAngle" class="${inputClass}" data-autogen="input" value="${this.config.startAngle}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">结束角度 (度)</label>
                <input type="number" id="endAngle" class="${inputClass}" data-autogen="input" value="${this.config.endAngle}">
              </div>
            </div>
          </div>

          <div id="circle-params" class="${this.config.style === "circle" ? "" : "hidden"}">
             <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">中心 X</label>
                <input type="number" id="centerX-circle" class="${inputClass}" data-autogen="input" value="${this.config.centerX}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">中心 Y</label>
                <input type="number" id="centerY-circle" class="${inputClass}" data-autogen="input" value="${this.config.centerY}">
              </div>
            </div>
             <div class="${groupClass}">
                <label class="${labelClass}">最大半径</label>
                <input type="number" id="radius-circle" class="${inputClass}" data-autogen="input" value="${this.config.radius}">
              </div>
          </div>

          <div id="line-params" class="${this.config.style === "line" ? "" : "hidden"}">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
               <div class="${groupClass}">
                <label class="${labelClass}">起点 X</label>
                <input type="number" id="startX-line" class="${inputClass}" data-autogen="input" value="${this.config.startX}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">起点 Y</label>
                <input type="number" id="startY-line" class="${inputClass}" data-autogen="input" value="${this.config.startY}">
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
               <div class="${groupClass}">
                <label class="${labelClass}">终点 X</label>
                <input type="number" id="endX-line" class="${inputClass}" data-autogen="input" value="${this.config.endX}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">终点 Y</label>
                <input type="number" id="endY-line" class="${inputClass}" data-autogen="input" value="${this.config.endY}">
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">线宽</label>
                <input type="number" id="thickness-line" class="${inputClass}" data-autogen="input" value="${this.config.thickness}">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">线头样式</label>
                <select id="lineCap-line" class="${inputClass}" data-autogen="change">
                  <option value="round" ${this.config.lineCap === "round" ? "selected" : ""}>圆头</option>
                  <option value="butt" ${this.config.lineCap === "butt" ? "selected" : ""}>平头</option>
                  <option value="square" ${this.config.lineCap === "square" ? "selected" : ""}>方头</option>
                </select>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div class="${groupClass}">
              <label class="${labelClass}">颜色</label>
              <input type="color" id="color" class="${inputClass} h-10 p-1" data-autogen="input" value="${this.config.color}">
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">填充类型</label>
              <select id="fillType" class="${inputClass}" data-autogen="change">
                <option value="solid" ${this.config.fillType === "solid" ? "selected" : ""}>实色</option>
                <option value="gradient" ${this.config.fillType === "gradient" ? "selected" : ""}>渐变</option>
              </select>
            </div>
            <div id="gradient-color-wrap" class="${groupClass} ${this.config.fillType === "gradient" ? "" : "hidden"}">
              <label class="${labelClass}">渐变结束色</label>
              <input type="color" id="gradientColor" class="${inputClass} h-10 p-1" data-autogen="input" value="${this.config.gradientColor}">
            </div>
          </div>

          <div class="${groupClass}">
            <label class="${labelClass}">背景轨道颜色</label>
            <input type="text" id="bgColor" class="${inputClass}" data-autogen="input" value="${this.config.bgColor}" placeholder="如: rgba(255,255,255,0.1)">
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">文件名前缀</label>
              <input type="text" id="prefix" class="${inputClass}" data-autogen="input" value="${this.config.prefix}">
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">文件名后缀</label>
              <input type="text" id="suffix" class="${inputClass}" data-autogen="input" value="${this.config.suffix}">
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button id="download-zip" class="${primaryBtnClass}">下载纹理集 (ZIP)</button>
            <button id="refresh-preview" class="${secondaryBtnClass}">刷新预览</button>
          </div>
        </div>

        <div class="${panelClass}">
          <h2 class="${h2Class}">预览区域</h2>
          <div id="preview-container" class="preview-grid flex flex-wrap gap-4 min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed border-[hsl(var(--muted))] p-4">
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    this.previewContainer = container.querySelector("#preview-container");

    // Event listeners
    container.addEventListener("input", (e) => {
      if (e.target.dataset.autogen === "input") {
        this.updateConfig(e.target);
        this.debouncedGenerate();
      }
    });

    container.addEventListener("change", (e) => {
      if (e.target.dataset.autogen === "change") {
        this.updateConfig(e.target);
        this.updateUI(container);
        this.debouncedGenerate();
      }
    });

    container.querySelector("#download-zip").onclick = () => this.download();
    container.querySelector("#refresh-preview").onclick = () => this.generate();

    this.generate();
  }

  updateUI(container) {
    const style = container.querySelector("#style").value;
    container.querySelector("#arc-params").classList.toggle("hidden", style !== "arc");
    container.querySelector("#circle-params").classList.toggle("hidden", style !== "circle");
    container.querySelector("#line-params").classList.toggle("hidden", style !== "line");

    const fillType = container.querySelector("#fillType").value;
    container.querySelector("#gradient-color-wrap").classList.toggle("hidden", fillType !== "gradient");
  }

  updateConfig(target) {
    const id = target.id.split("-")[0];
    const value = target.type === "number" ? parseFloat(target.value) : target.value;
    this.config[id] = value;
    
    // Synchronize specific style fields if needed
    if (target.id.includes("thickness")) this.config.thickness = parseFloat(target.value);
    if (target.id.includes("lineCap")) this.config.lineCap = target.value;
    if (target.id.includes("centerX")) this.config.centerX = parseFloat(target.value);
    if (target.id.includes("centerY")) this.config.centerY = parseFloat(target.value);
    if (target.id.includes("radius")) this.config.radius = parseFloat(target.value);
  }

  async generate() {
    this.generatedImages = [];
    this.previewContainer.innerHTML = "";

    const steps = Math.max(1, this.config.steps);
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const canvas = document.createElement("canvas");
      canvas.width = this.config.width;
      canvas.height = this.config.height;
      const ctx = canvas.getContext("2d");

      this.drawProgress(ctx, progress);

      const wrapper = document.createElement("div");
      wrapper.className = "flex flex-col items-center gap-1 text-center";
      wrapper.appendChild(canvas);
      
      const label = document.createElement("div");
      label.className = "text-[10px] text-[hsl(var(--muted-foreground))]";
      label.textContent = `${Math.round(progress * 100)}%`;
      wrapper.appendChild(label);
      
      this.previewContainer.appendChild(wrapper);
      this.generatedImages.push({ index: i, canvas });
    }
  }

  drawProgress(ctx, progress) {
    const { style, centerX, centerY, radius, thickness, startAngle, endAngle, color, bgColor, fillType, gradientColor, lineCap } = this.config;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const currentEndRad = startRad + (endRad - startRad) * progress;

    if (style === "arc") {
      // Background track
      if (bgColor) {
        ctx.beginPath();
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = thickness;
        ctx.lineCap = lineCap;
        ctx.arc(centerX, centerY, radius, startRad, endRad);
        ctx.stroke();
      }

      // Foreground progress
      ctx.beginPath();
      if (fillType === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
        grad.addColorStop(0, color);
        grad.addColorStop(1, gradientColor);
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = color;
      }
      ctx.lineWidth = thickness;
      ctx.lineCap = lineCap;
      ctx.arc(centerX, centerY, radius, startRad, currentEndRad);
      ctx.stroke();
    } else if (style === "circle") {
      // ... circle code same ...
      // Background
      if (bgColor) {
        ctx.beginPath();
        ctx.fillStyle = bgColor;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Solid circle scaling or filling
      ctx.beginPath();
      if (fillType === "gradient") {
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, gradientColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = color;
      }
      ctx.arc(centerX, centerY, radius * progress, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === "line") {
        const { startX, startY, endX, endY } = this.config;

        // Background
        if (bgColor) {
            ctx.beginPath();
            ctx.strokeStyle = bgColor;
            ctx.lineWidth = thickness;
            ctx.lineCap = lineCap;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Progress
        ctx.beginPath();
        if (fillType === "gradient") {
            const grad = ctx.createLinearGradient(startX, startY, endX, endY);
            grad.addColorStop(0, color);
            grad.addColorStop(1, gradientColor);
            ctx.strokeStyle = grad;
        } else {
            ctx.strokeStyle = color;
        }
        ctx.lineWidth = thickness;
        ctx.lineCap = lineCap;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (endX - startX) * progress, startY + (endY - startY) * progress);
        ctx.stroke();
    }
  }

  async download() {
    if (this.generatedImages.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("progress_assets");

    for (const item of this.generatedImages) {
      const dataUrl = item.canvas.toDataURL("image/png");
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const filename = `${this.config.prefix}_${item.index}${this.config.suffix}.png`;
      folder.file(filename, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `progress_textures_${Date.now()}.zip`;
    link.click();
  }

  destroy() {}
}
