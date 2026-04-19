import { useState, useEffect } from "react";
import { Star, RotateCcw } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeCardId, setActiveCardId] = useState(flashcard?._id);
  const { addNotification } = useNotifications();

  // যখনই flashcard._id পরিবর্তন হবে
  useEffect(() => {
    if (flashcard?._id !== activeCardId) {
      // ১. আগে কার্ডটিকে সোজা করি
      setIsFlipped(false);

      // ২. সামান্য ডিলে দেই যেন সোজা হওয়ার অ্যানিমেশন শুরু হয়, তারপর ডাটা বদলাই
      const timer = setTimeout(() => {
        setActiveCardId(flashcard?._id);
      }, 150); // এই গ্যাপটুকুতে উত্তর দেখা সম্ভব না কারণ কার্ড তখন সোজা হচ্ছে

      return () => clearTimeout(timer);
    }
  }, [flashcard?._id, activeCardId]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar(flashcard._id);

    if (!flashcard.isStarred) {
      addNotification(`Starred: ${flashcard.question.substring(0, 20)}...`);
    } else {
      addNotification("Removed from starred flashcards.");
    }
  };

  // যদি আইডি ম্যাচ না করে (অর্থাৎ নেক্সট ক্লিক করা হয়েছে কিন্তু কার্ড ঘুরছে),
  // তবে আমরা পুরনো বা খালি ডাটা দেখাবো না, বরং লোডিং স্টেট বা আগের প্রশ্নটাই রাখবো
  const currentDisplayCard = flashcard?._id === activeCardId ? flashcard : null;

  return (
    <div className="relative w-full h-72" style={{ perspective: "1000px" }}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* Front of the card (Question) */}
        <div
          className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl border-2 border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase">
              {currentDisplayCard?.difficulty || flashcard?.difficulty}
            </div>
            <button
              onClick={handleStarClick}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                flashcard.isStarred
                  ? "bg-amber-400 text-white shadow-lg shadow-amber-500/25"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500"
              }`}
            >
              <Star
                className="w-4 h-4"
                strokeWidth={2}
                fill={flashcard.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <p className="text-lg font-semibold text-slate-900 text-center leading-relaxed">
              {/* শুধুমাত্র তখনই প্রশ্ন দেখাবে যখন আইডি ম্যাচ করবে */}
              {currentDisplayCard ? currentDisplayCard.question : "Loading..."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* Back of the card (Answer) */}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-emerald-400/60 rounded-2xl shadow-xl shadow-emerald-500/30 p-8 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className="w-full h-full flex flex-col justify-between"
            style={{ transform: "rotateY(0deg)" }}
          >
            <div className="flex justify-end">
              <button
                onClick={handleStarClick}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  flashcard.isStarred
                    ? "bg-white/30 backdrop-blur-sm text-white border border-white/40"
                    : "bg-white/20 backdrop-blur-sm text-white/70 hover:bg-white/30 hover:text-white border border-white/20"
                }`}
              >
                <Star
                  className="w-4 h-4"
                  strokeWidth={2}
                  fill={flashcard.isStarred ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-6">
              <p className="text-base text-white text-center leading-relaxed font-medium">
                {/* আইডি ম্যাচ না করা পর্যন্ত এখানে উত্তর রেন্ডার হবেই না */}
                {currentDisplayCard ? currentDisplayCard.answer : ""}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-white/70 font-medium">
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Click to see question</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
