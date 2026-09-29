type Props = { id: string; title: string; label?: string };

export default function VideoEmbed({ id, title, label }: Props) {
  const url = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0`;
  return (
    <div className="video-card">
      <div className="video-frame">
        <iframe
          src={url}
          title={title}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="video-caption">
        <div><span className="eyebrow">{label || "Featured video"}</span><h3>{title}</h3></div>
        <a href={`https://www.youtube.com/shorts/${id}`} target="_blank" rel="noreferrer" aria-label={`Watch ${title} on YouTube`}>↗</a>
      </div>
    </div>
  );
}
