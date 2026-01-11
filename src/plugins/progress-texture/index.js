import JSZip from "jszip";
import { createI18n } from "../../utils/i18n.js";
import { translations } from "./locales.js";

export class ProgressTexturePlugin {
  constructor() {
    const { t } = createI18n(translations);
    this.t = t;
    this.name = t("name");
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
      gradientType: "linear", // linear, radial
      gradientAngle: 270,
      gradientStops: [
        { offset: 0, color: "#ff0000" },
        { offset: 1, color: "#00ff00" },
      ],
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
      "w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-3 pr-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--ring))] focus:ring-4 focus:ring-[hsl(var(--ring)/0.18)]";
    const selectClass = `${inputClass} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22rgba(150,150,150,0.8)%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[size:1rem_1rem] bg-no-repeat`;
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
          <h2 class="${h2Class}">${this.t("name")}</h2>
          
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("style")}</label>
              <select id="style" class="${selectClass}" data-autogen="change">
                <option value="arc" ${
                  this.config.style === "arc" ? "selected" : ""
                }>${this.t("style_arc")}</option>
                <option value="circle" ${
                  this.config.style === "circle" ? "selected" : ""
                }>${this.t("style_circle")}</option>
                <option value="line" ${
                  this.config.style === "line" ? "selected" : ""
                }>${this.t("style_line")}</option>
              </select>
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("steps")}</label>
              <input type="number" id="steps" class="${inputClass}" data-autogen="input" value="${
      this.config.steps
    }">
            </div>
          </div>


          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("canvas_width")}</label>
              <input type="number" id="width" class="${inputClass}" data-autogen="input" value="${
      this.config.width
    }">
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("canvas_height")}</label>
              <input type="number" id="height" class="${inputClass}" data-autogen="input" value="${
      this.config.height
    }">
            </div>
          </div>


          <div id="arc-params" class="${
            this.config.style === "arc" ? "" : "hidden"
          }">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("center_x")}</label>
                <input type="number" id="centerX" class="${inputClass}" data-autogen="input" value="${
      this.config.centerX
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("center_y")}</label>
                <input type="number" id="centerY" class="${inputClass}" data-autogen="input" value="${
      this.config.centerY
    }">
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("radius")}</label>
                <input type="number" id="radius" class="${inputClass}" data-autogen="input" value="${
      this.config.radius
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("thickness")}</label>
                <input type="number" id="thickness" class="${inputClass}" data-autogen="input" value="${
      this.config.thickness
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("line_cap")}</label>
                <select id="lineCap" class="${selectClass}" data-autogen="change">
                  <option value="round" ${
                    this.config.lineCap === "round" ? "selected" : ""
                  }>${this.t("cap_round")}</option>
                  <option value="butt" ${
                    this.config.lineCap === "butt" ? "selected" : ""
                  }>${this.t("cap_butt")}</option>
                  <option value="square" ${
                    this.config.lineCap === "square" ? "selected" : ""
                  }>${this.t("cap_square")}</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("start_angle")}</label>
                <input type="number" id="startAngle" class="${inputClass}" data-autogen="input" value="${
      this.config.startAngle
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("end_angle")}</label>
                <input type="number" id="endAngle" class="${inputClass}" data-autogen="input" value="${
      this.config.endAngle
    }">
              </div>
            </div>
          </div>


          <div id="circle-params" class="${
            this.config.style === "circle" ? "" : "hidden"
          }">
             <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("center_x_circle")}</label>
                <input type="number" id="centerX-circle" class="${inputClass}" data-autogen="input" value="${
      this.config.centerX
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("center_y_circle")}</label>
                <input type="number" id="centerY-circle" class="${inputClass}" data-autogen="input" value="${
      this.config.centerY
    }">
              </div>
            </div>
             <div class="${groupClass}">
                <label class="${labelClass}">${this.t("max_radius")}</label>
                <input type="number" id="radius-circle" class="${inputClass}" data-autogen="input" value="${
      this.config.radius
    }">
              </div>
          </div>


          <div id="line-params" class="${
            this.config.style === "line" ? "" : "hidden"
          }">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
               <div class="${groupClass}">
                <label class="${labelClass}">${this.t("start_x")}</label>
                <input type="number" id="startX-line" class="${inputClass}" data-autogen="input" value="${
      this.config.startX
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("start_y")}</label>
                <input type="number" id="startY-line" class="${inputClass}" data-autogen="input" value="${
      this.config.startY
    }">
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
               <div class="${groupClass}">
                <label class="${labelClass}">${this.t("end_x")}</label>
                <input type="number" id="endX-line" class="${inputClass}" data-autogen="input" value="${
      this.config.endX
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("end_y")}</label>
                <input type="number" id="endY-line" class="${inputClass}" data-autogen="input" value="${
      this.config.endY
    }">
              </div>
            </div>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("line_width")}</label>
                <input type="number" id="thickness-line" class="${inputClass}" data-autogen="input" value="${
      this.config.thickness
    }">
              </div>
              <div class="${groupClass}">
                <label class="${labelClass}">${this.t("line_cap")}</label>
                <select id="lineCap-line" class="${selectClass}" data-autogen="change">
                  <option value="round" ${
                    this.config.lineCap === "round" ? "selected" : ""
                  }>${this.t("cap_round")}</option>
                  <option value="butt" ${
                    this.config.lineCap === "butt" ? "selected" : ""
                  }>${this.t("cap_butt")}</option>
                  <option value="square" ${
                    this.config.lineCap === "square" ? "selected" : ""
                  }>${this.t("cap_square")}</option>
                </select>
              </div>
            </div>
          </div>


          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("color_mode")}</label>
              <select id="fillType" class="${selectClass}" data-autogen="change">
                <option value="solid" ${
                  this.config.fillType === "solid" ? "selected" : ""
                }>${this.t("fill_solid")}</option>
                <option value="gradient" ${
                  this.config.fillType === "gradient" ? "selected" : ""
                }>${this.t("fill_gradient")}</option>
              </select>
            </div>
            <div id="solid-color-wrap" class="${groupClass} ${
      this.config.fillType === "solid" ? "" : "hidden"
    }">
              <label class="${labelClass}">${this.t("fill_color")}</label>
              <input type="color" id="color" class="h-10 w-full cursor-pointer rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-1" data-autogen="input" value="${
      this.config.color
    }">
            </div>
          </div>

          <div id="gradient-controls" class="space-y-4 ${
            this.config.fillType === "gradient" ? "" : "hidden"
          } mb-5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="${groupClass} mb-0">
                <label class="${labelClass}">${this.t("gradient_type")}</label>
                <select id="gradientType" class="${selectClass}" data-autogen="change">
                  <option value="linear" ${
                    this.config.gradientType === "linear" ? "selected" : ""
                  }>${this.t("gradient_linear")}</option>
                  <option value="radial" ${
                    this.config.gradientType === "radial" ? "selected" : ""
                  }>${this.t("gradient_radial")}</option>
                  <option value="conic" ${
                    this.config.gradientType === "conic" ? "selected" : ""
                  }>${this.t("gradient_conic")}</option>
                </select>
              </div>
              <div id="gradient-angle-wrap" class="${groupClass} mb-0 ${
      this.config.gradientType !== "radial" ? "" : "hidden"
    }">
                <div class="flex items-center justify-between">
                  <label id="gradient-angle-label" class="${labelClass}">${
      this.config.gradientType === "conic" ? this.t("gradient_start_angle") : this.t("gradient_angle")
    }</label>
                  <div id="angle-value-container" class="mb-2"></div>
                </div>
                <input type="range" id="gradientAngle" min="0" max="360" class="w-full" data-autogen="input" value="${
                  this.config.gradientAngle
                }">
              </div>
            </div>

            <div class="${groupClass} mb-0">
              <label class="${labelClass}">${this.t("gradient_stops_preview")}</label>

              <div class="relative mb-4 px-[1px]">
                <div id="gradient-bar" class="relative h-8 w-full cursor-crosshair rounded-md border border-[hsl(var(--border))]" style="background: ${this.getGradientCSS()}">
                  <div id="stops-container" class="absolute inset-0"></div>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <div id="stops-list" class="flex flex-wrap items-center gap-2">
                  <!-- List of stops will be rendered here -->
                </div>
                <button id="add-stop" class="${secondaryBtnClass} h-9 py-0 text-xs text-nowrap">${this.t("add_stop")}</button>
              </div>
            </div>
          </div>

          <div class="${groupClass}">
            <label class="${labelClass}">${this.t("bg_color_label")}</label>
            <input type="text" id="bgColor" class="${inputClass}" data-autogen="input" value="${
      this.config.bgColor
    }" placeholder="${this.t("bg_color_placeholder")}">
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("prefix")}</label>
              <input type="text" id="prefix" class="${inputClass}" data-autogen="input" value="${
      this.config.prefix
    }">
            </div>
            <div class="${groupClass}">
              <label class="${labelClass}">${this.t("suffix")}</label>
              <input type="text" id="suffix" class="${inputClass}" data-autogen="input" value="${
      this.config.suffix
    }" placeholder="${this.t("suffix_placeholder")}">
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button id="download-zip" class="${primaryBtnClass}">${this.t("download_zip_btn")}</button>
            <button id="refresh-preview" class="${secondaryBtnClass}">${this.t("refresh_preview_btn")}</button>
          </div>
        </div>

        <div class="${panelClass}">
          <h2 class="${h2Class}">${this.t("preview_area")}</h2>
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
        this.updateUI(container);
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

    container.querySelector("#add-stop").onclick = () => {
      this.config.gradientStops.push({ offset: 1, color: "#ffffff" });
      this.config.gradientStops.sort((a, b) => a.offset - b.offset);
      this.renderStops(container);
      this.updateGradientPreview(container);
      this.debouncedGenerate();
    };

    container.querySelector("#gradient-bar").onclick = (e) => {
      if (e.target.id !== "gradient-bar" && e.target.id !== "stops-container") return;
      const rect = container.querySelector("#gradient-bar").getBoundingClientRect();
      const offset = (e.clientX - rect.left) / rect.width;
      this.config.gradientStops.push({ 
        offset: parseFloat(Math.max(0, Math.min(1, offset)).toFixed(2)), 
        color: "#ffffff" 
      });
      this.config.gradientStops.sort((a, b) => a.offset - b.offset);
      this.renderStops(container);
      this.updateGradientPreview(container);
      this.debouncedGenerate();
    };

    this.renderStops(container);
    this.generate();
  }

  getGradientCSS() {
    const stops = this.config.gradientStops
      .map((s) => `${s.color} ${s.offset * 100}%`)
      .join(", ");
    // UI preview always uses a horizontal linear gradient for better stop visualization
    return `linear-gradient(90deg, ${stops})`;
  }

  updateGradientPreview(container) {
    const bar = container.querySelector("#gradient-bar");
    if (bar) bar.style.background = this.getGradientCSS();
  }

  renderStops(container) {
    const stopsList = container.querySelector("#stops-list");
    const stopsContainer = container.querySelector("#stops-container");
    if (!stopsList || !stopsContainer) return;

    stopsList.innerHTML = "";
    stopsContainer.innerHTML = "";

    this.config.gradientStops.forEach((stop, index) => {
      // List item
      const item = document.createElement("div");
      const canRemove = this.config.gradientStops.length > 2;
      item.className = "group relative flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1 shadow-sm transition-all";
      // Fixed width to prevent jumping when remove button shows
      item.style.minWidth = canRemove ? "108px" : "85px";

      item.innerHTML = `
        <input type="color" value="${stop.color}" class="h-6 w-8 cursor-pointer rounded border-none bg-transparent p-0" data-stop-index="${index}" data-type="color">
        <input type="number" value="${stop.offset}" step="0.01" min="0" max="1" class="w-12 border-none bg-transparent px-1 py-0 text-xs focus:ring-0 text-center" data-stop-index="${index}" data-type="offset">
        ${canRemove ? `<button class="flex h-5 w-5 items-center justify-center rounded-md text-[10px] text-red-500 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100" data-stop-index="${index}" data-type="remove" title="${this.t("remove_title")}">✕</button>` : ""}
      `;


      item.querySelector("[data-type='color']").oninput = (e) => {
        stop.color = e.target.value;
        this.updateGradientPreview(container);
        this.debouncedGenerate();
      };

      item.querySelector("[data-type='offset']").oninput = (e) => {
        stop.offset = parseFloat(e.target.value);
        this.updateGradientPreview(container);
        this.debouncedGenerate();
      };
      
      item.querySelector("[data-type='offset']").onblur = () => {
        this.config.gradientStops.sort((a, b) => a.offset - b.offset);
        this.renderStops(container);
      };

      if (canRemove) {
        item.querySelector("[data-type='remove']").onclick = () => {
          this.config.gradientStops.splice(index, 1);
          this.renderStops(container);
          this.updateGradientPreview(container);
          this.debouncedGenerate();
        };
      }

      stopsList.appendChild(item);

      // Visual marker on bar
      const marker = document.createElement("div");
      marker.className = "absolute top-0 h-full w-3 -translate-x-1/2 border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform active:scale-125 z-10";
      marker.style.left = `${stop.offset * 100}%`;
      marker.style.backgroundColor = stop.color;
      marker.style.borderRadius = "2px";
      
      // Dragging logic
      marker.onmousedown = (e) => {
        e.preventDefault();
        const bar = container.querySelector("#gradient-bar");
        const rect = bar.getBoundingClientRect();
        
        const onMouseMove = (moveEvent) => {
          let offset = (moveEvent.clientX - rect.left) / rect.width;
          offset = Math.max(0, Math.min(1, offset));
          stop.offset = parseFloat(offset.toFixed(2));
          this.renderStops(container);
          this.updateGradientPreview(container);
          this.debouncedGenerate();
        };
        
        const onMouseUp = () => {
          this.config.gradientStops.sort((a, b) => a.offset - b.offset);
          this.renderStops(container);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };
        
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      stopsContainer.appendChild(marker);
    });
  }

  updateUI(container) {
    const style = container.querySelector("#style").value;
    container.querySelector("#arc-params").classList.toggle("hidden", style !== "arc");
    container.querySelector("#circle-params").classList.toggle("hidden", style !== "circle");
    container.querySelector("#line-params").classList.toggle("hidden", style !== "line");

    const fillType = container.querySelector("#fillType").value;
    container.querySelector("#solid-color-wrap").classList.toggle("hidden", fillType !== "solid");
    container.querySelector("#gradient-controls").classList.toggle("hidden", fillType !== "gradient");

    const gradientType = container.querySelector("#gradientType")?.value;
    const angleWrap = container.querySelector("#gradient-angle-wrap");
    if (angleWrap) angleWrap.classList.toggle("hidden", gradientType === "radial");
    
    const angleLabel = container.querySelector("#gradient-angle-label");
    if (angleLabel) {
      angleLabel.textContent = gradientType === "conic" ? "渐变起始角度" : "渐变角度";
    }

    this.renderAngleValue(container);
    this.updateGradientPreview(container);
  }

  renderAngleValue(container) {
    const valueContainer = container.querySelector("#angle-value-container");
    if (!valueContainer) return;

    const renderButton = () => {
      valueContainer.innerHTML = "";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rounded-md border border-transparent px-1.5 py-0.5 font-mono text-xs text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--background))] hover:text-[hsl(var(--foreground))]";
      btn.textContent = `${this.config.gradientAngle}°`;
      btn.title = "点击编辑";
      
      btn.onclick = () => {
        valueContainer.innerHTML = "";
        const input = document.createElement("input");
        input.type = "number";
        input.className = "w-16 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--foreground))] shadow-sm outline-none focus:border-[hsl(var(--ring))] focus:ring-4 focus:ring-[hsl(var(--ring)/0.18)]";
        input.value = this.config.gradientAngle;
        input.min = "0";
        input.max = "360";
        
        const commit = () => {
          let val = parseFloat(input.value);
          if (isNaN(val)) val = this.config.gradientAngle;
          val = Math.max(0, Math.min(360, val));
          this.config.gradientAngle = val;
          const slider = container.querySelector("#gradientAngle");
          if (slider) slider.value = val;
          renderButton();
          this.debouncedGenerate();
          this.updateGradientPreview(container);
        };

        input.onkeydown = (e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") renderButton();
        };
        
        input.onblur = commit;
        
        valueContainer.appendChild(input);
        input.focus();
        input.select();
      };
      
      valueContainer.appendChild(btn);
    };

    // If we're already editing (input is child of container), don't overwrite
    if (!valueContainer.querySelector("input")) {
      renderButton();
    } else {
      // Just update the input value if the slider moved
      const input = valueContainer.querySelector("input");
      if (document.activeElement !== input) {
        input.value = this.config.gradientAngle;
      }
    }
  }

  updateConfig(target) {
    const id = target.id.split("-")[0];
    const value = target.type === "number" || target.type === "range" ? parseFloat(target.value) : target.value;
    this.config[id] = value;
    
    // Synchronize specific style fields if needed
    if (target.id.includes("thickness")) this.config.thickness = parseFloat(target.value);
    if (target.id.includes("lineCap")) this.config.lineCap = target.value;
    if (target.id.includes("centerX")) this.config.centerX = parseFloat(target.value);
    if (target.id.includes("centerY")) this.config.centerY = parseFloat(target.value);
    if (target.id.includes("radius")) this.config.radius = parseFloat(target.value);
  }

  createCanvasGradient(ctx, width, height) {
    const { gradientType, gradientAngle, gradientStops, centerX, centerY, radius } = this.config;
    let grad;

    if (gradientType === "linear") {
      const angleRad = (gradientAngle - 90) * (Math.PI / 180);
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.max(width, height) / 2;
      
      const x1 = cx - Math.cos(angleRad) * r;
      const y1 = cy - Math.sin(angleRad) * r;
      const x2 = cx + Math.cos(angleRad) * r;
      const y2 = cy + Math.sin(angleRad) * r;
      
      grad = ctx.createLinearGradient(x1, y1, x2, y2);
    } else if (gradientType === "radial") {
      // Use config centerX/Y for radial to match circle/arc position
      const cx = typeof centerX === "number" ? centerX : width / 2;
      const cy = typeof centerY === "number" ? centerY : height / 2;
      // For radial, usually we want it to cover the active area
      const r = Math.max(width, height, radius * 2 || 0);
      grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    } else if (gradientType === "conic") {
      const cx = typeof centerX === "number" ? centerX : width / 2;
      const cy = typeof centerY === "number" ? centerY : height / 2;
      // createConicGradient(startAngleInRadians, x, y)
      const startAngleRad = (gradientAngle * Math.PI) / 180;
      if (ctx.createConicGradient) {
        grad = ctx.createConicGradient(startAngleRad, cx, cy);
      } else {
        // Fallback for older browsers if needed, but modern ones should have it
        grad = ctx.createLinearGradient(0, 0, width, height); 
      }
    }

    gradientStops.forEach((stop) => {
      grad.addColorStop(Math.max(0, Math.min(1, stop.offset)), stop.color);
    });

    return grad;
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
        ctx.strokeStyle = this.createCanvasGradient(ctx, ctx.canvas.width, ctx.canvas.height);
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
        ctx.fillStyle = this.createCanvasGradient(ctx, ctx.canvas.width, ctx.canvas.height);
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
            ctx.strokeStyle = this.createCanvasGradient(ctx, ctx.canvas.width, ctx.canvas.height);
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
