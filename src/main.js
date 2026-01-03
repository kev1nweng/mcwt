import { CharacterSpritePlugin } from "./plugins/character-sprite/index.js";

class ToolkitApp {
  constructor() {
    this.version = __APP_VERSION__;
    this.plugins = [new CharacterSpritePlugin()];
    this.activePlugin = null;
    this.init();
  }

  init() {
    // Update version strings
    document.querySelectorAll(".app-version").forEach((el) => {
      el.textContent = `版本 ${this.version}`;
    });

    const nav = document.getElementById("plugin-nav");
    this.plugins.forEach((plugin) => {
      const btn = document.createElement("div");
      btn.className = "nav-item";
      btn.textContent = plugin.name;
      btn.onclick = () => this.loadPlugin(plugin);
      nav.appendChild(btn);
    });

    // Load first plugin by default
    if (this.plugins.length > 0) {
      this.loadPlugin(this.plugins[0]);
    }

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
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.textContent === plugin.name);
    });

    const content = document.getElementById("plugin-content");
    content.innerHTML = "";
    plugin.render(content);
    // Handle auto-hiding scrollbar on scroll
    const container = document.querySelector(".tui-container");
    let scrollTimeout;
    container.onscroll = () => {
      container.classList.add("is-scrolling");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        container.classList.remove("is-scrolling");
      }, 1000);
    };
  }
}

new ToolkitApp();
