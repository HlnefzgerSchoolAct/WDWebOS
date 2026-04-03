function DuckLife3Window() {
  return (
    <section className="wd-minecraft-window" aria-label="Duck Life 3 game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/ducklife3/index.html"
        title="Duck Life 3"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default DuckLife3Window