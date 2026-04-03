function RetroBowlWindow() {
  return (
    <section className="wd-minecraft-window" aria-label="Retro Bowl game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/retrobowl/index.html"
        title="Retro Bowl"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default RetroBowlWindow
