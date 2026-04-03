function BasketballStarsWindow() {
  return (
    <section className="wd-minecraft-window" aria-label="Basketball Stars game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/basketballstars/index.html"
        title="Basketball Stars"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default BasketballStarsWindow
