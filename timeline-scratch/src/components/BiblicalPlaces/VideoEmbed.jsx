/**
 * Embeds a BibleProject (or other) YouTube video at the top of a modal.
 * Expects resources filtered to type === 'video'.
 */
export function VideoEmbed({ resources }) {
  if (!resources || resources.length === 0) return null;

  // Pick the first video resource
  const video = resources.find(r => r.resource_type === 'video');
  if (!video) return null;

  // Build embed URL from the resource's embed_url or derive from url
  let embedUrl = video.embed_url;
  if (!embedUrl && video.url) {
    const match = video.url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    if (match) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${match[1]}`;
    }
  }

  if (!embedUrl) return null;

  return (
    <div className="bp-video-embed">
      <div className="bp-video-wrapper">
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="bp-video-info">
        <span className="bp-video-provider">{video.provider || 'BibleProject'}</span>
        <span className="bp-video-title">{video.title}</span>
      </div>
      {video.description && (
        <p className="bp-video-description">{video.description}</p>
      )}
    </div>
  );
}
