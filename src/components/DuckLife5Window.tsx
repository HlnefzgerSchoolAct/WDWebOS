function DuckLife5Window() {
  return (
    <section className="wd-minecraft-window" aria-label="Duck Life 5 game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/ducklife5/play/index.html"
        title="Duck Life 5"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default DuckLife5Window