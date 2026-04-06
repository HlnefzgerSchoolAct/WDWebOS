type GameWindowProps = {
  title: string
  src: string
}

function GameWindow({ title, src }: GameWindowProps) {
  return (
    <section className="wd-game-window" aria-label={`${title} game`}>
      <iframe
        className="wd-game-frame"
        src={src}
        title={title}
        allow="fullscreen; gamepad; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </section>
  )
}

export default GameWindow