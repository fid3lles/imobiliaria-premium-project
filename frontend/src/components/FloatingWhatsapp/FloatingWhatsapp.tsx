import { FaWhatsapp } from "react-icons/fa";
import { redirectToWhatsapp } from "../../utils/Whatsapp.utils";

export default function FloatingWhatsappButton() {
  const handleClick = () => {
    redirectToWhatsapp("Olá! Gostaria de mais informações...");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Abrir WhatsApp"
      className="
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        h-14 w-14 rounded-full
        bg-green-500 text-white
        shadow-lg hover:scale-105 active:scale-95
        transition-transform
      "
    >
      <FaWhatsapp size={28} />
    </button>
  );
}
