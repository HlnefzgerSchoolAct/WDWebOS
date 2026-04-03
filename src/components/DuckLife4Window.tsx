function DuckLife4Window() {
  return (
    <section className="wd-minecraft-window" aria-label="Duck Life 4 game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/ducklife4/index.html"
        title="Duck Life 4"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default DuckLife4Window