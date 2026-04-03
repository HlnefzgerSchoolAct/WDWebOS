function BackcountryWindow() {
  return (
    <section className="wd-minecraft-window" aria-label="Backcountry game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/backcountry/index.html"
        title="Backcountry"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default BackcountryWindow
