const phone = 5511923749516;

export function redirectToWhatsapp(message: string) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}
