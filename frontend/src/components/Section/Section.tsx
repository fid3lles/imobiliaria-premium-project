export default function Section({
  bg,
  children,
  className = "",
}: {
  bg?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative w-full bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Conteúdo */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {children}
      </div>
    </section>
  );
}
