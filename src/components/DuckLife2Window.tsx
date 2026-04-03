function DuckLife2Window() {
  return (
    <section className="wd-minecraft-window" aria-label="Duck Life 2 game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/ducklife2/index.html"
        title="Duck Life 2"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default DuckLife2Window