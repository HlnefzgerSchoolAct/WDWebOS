function MinecraftWindow() {
  return (
    <section className="wd-minecraft-window" aria-label="Minecraft game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/minecraft.html"
        title="Minecraft"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default MinecraftWindow
