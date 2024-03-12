export function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false, // Utilisez le format 24 heures
  };

  // Créez un objet Date à partir de la chaîne de caractères de la date
  // et formatez-le selon les options spécifiées et le locale 'fr-FR'
  return new Intl.DateTimeFormat("fr-FR", options).format(new Date(dateString));
}
