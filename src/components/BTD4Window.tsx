function BTD4Window() {
  return (
    <section className="wd-minecraft-window" aria-label="Bloons Tower Defense 4 game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/btd4/index.html"
        title="Bloons TD 4"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default BTD4Window