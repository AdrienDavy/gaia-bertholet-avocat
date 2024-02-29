// Fonction pour transformer l'URL de la vidéo YouTube en URL d'intégration
export function transformYouTubeUrl(videoUrl: string): string {
  const match = videoUrl.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return videoUrl; // Retourne l'URL originale si aucune correspondance n'est trouvée
}
