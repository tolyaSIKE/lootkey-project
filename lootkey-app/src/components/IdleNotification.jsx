import { useEffect, useState } from "react";

export default function IdleNotification() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      setShow(false);

      timeout = setTimeout(
        () => {
          setShow(true);

          setTimeout(() => {
            setShow(false);
          }, 8000);
        },
        10 * 60 * 1000,
      );
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeout);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fadeIn">
      <div className="bg-[#1f2937] border border-green-500 text-white px-5 py-4 rounded-xl shadow-2xl max-w-[320px]">
        <div className="text-green-400 font-semibold mb-1">
          LootKey Reminder
        </div>

        <p className="text-sm text-gray-200">
          Still browsing games? Your cart and favorites are waiting! 🔥🔥
        </p>
      </div>
    </div>
  );
}
