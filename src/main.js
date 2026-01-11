import { CharacterSpritePlugin } from "./plugins/character-sprite/index.js";
import { ProgressTexturePlugin } from "./plugins/progress-texture/index.js";
import { createI18n } from "./utils/i18n.js";
import { translations } from "./locales.js";

class ToolkitApp {
  constructor() {
    this.t = createI18n(translations).t;
    this.version = __APP_VERSION__;
    this.plugins = [new CharacterSpritePlugin(), new ProgressTexturePlugin()];
    this.activePlugin = null;
    this.navButtons = [];
    this.init();
  }

  getNavButtonClass(isActive) {
    const base =
      "inline-flex items-center select-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
    const inactive =
      "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]";
    const active = "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]";
    return `${base} ${isActive ? active : inactive}`;
  }

  init() {
    // Update static translations
    document.title = this.t("app_title");
    const appTitle = document.getElementById("app-title-text");
    if (appTitle) appTitle.textContent = this.t("app_title");

    const systemStatus = document.getElementById("system-status-title");
    if (systemStatus) systemStatus.textContent = this.t("system_status");

    const welcomeMsg = document.getElementById("welcome-msg");
    if (welcomeMsg) welcomeMsg.textContent = this.t("welcome");

    const selectModuleMsg = document.getElementById("select-module-msg");
    if (selectModuleMsg) selectModuleMsg.textContent = this.t("select_module");

    // Update version strings
    document.querySelectorAll(".app-version").forEach((el) => {
      el.textContent = `${this.t("version")} ${this.version}`;
    });

    const nav = document.getElementById("plugin-nav");
    this.plugins.forEach((plugin) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = this.getNavButtonClass(false);
      btn.textContent = plugin.name;
      btn.dataset.pluginName = plugin.name;
      btn.addEventListener("click", () => this.loadPlugin(plugin));
      nav.appendChild(btn);
      this.navButtons.push(btn);
    });

    // Load first plugin by default
    if (this.plugins.length > 0) {
      this.loadPlugin(this.plugins[0]);
    }

    // Handle auto-hiding scrollbar on scroll
    const container = document.querySelector(".scroll-container");
    let scrollTimeout;
    container.addEventListener("scroll", () => {
      container.classList.add("is-scrolling");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        container.classList.remove("is-scrolling");
      }, 1000);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // Could implement a menu view here
      }
    });
  }

  loadPlugin(plugin) {
    if (this.activePlugin) {
      this.activePlugin.destroy();
    }

    this.activePlugin = plugin;

    // Update UI
    this.navButtons.forEach((btn) => {
      const isActive = btn.dataset.pluginName === plugin.name;
      btn.className = this.getNavButtonClass(isActive);
    });

    const content = document.getElementById("plugin-content");
    content.innerHTML = "";
    plugin.render(content);
  }
}

new ToolkitApp();
