export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-10 pb-6">
      <div className="relative mb-5">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
      </div>

      <div className="relative flex items-center justify-center px-6">
        <p className="text-gray-400 text-sm">
          LootKey Team © 2026
        </p>

        <div className="absolute right-6 flex items-center gap-4">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:scale-110 transition"
          >
            <img
              src="/lootkey-app/icons/instagram.png"
              alt="Instagram"
              className="w-7 h-7"
            />
          </a>

          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="hover:scale-110 transition"
          >
            <img
              src="/lootkey-app/icons/telegram.png"
              alt="Telegram"
              className="w-7 h-7"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}