function GeometryDashWindow() {
  return (
    <section className="wd-minecraft-window" aria-label="Geometry Dash game">
      <iframe
        className="wd-minecraft-frame"
        src="/games/geometrydash/index.html"
        title="Geometry Dash"
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default GeometryDashWindow
