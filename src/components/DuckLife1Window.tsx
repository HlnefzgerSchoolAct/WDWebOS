function DuckLife1Window() {
  return (
    <section className="wd-minecraft-window" aria-label="Duck Life 1 game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/ducklife/index.html"
        title="Duck Life 1"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default DuckLife1Window