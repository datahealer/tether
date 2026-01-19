import { useRef, useState, useEffect } from 'react';
import Header from "../components/homepage/Header";
import tetherlineone from "../assets/home/tetherlineone.png";
import Stars from "../assets/home/stars.svg";
import Applestore from "../assets/home/applestore.png";
import Googlestore from "../assets/home/googleplay.png";
import PhoneIcon from "../assets/home/phone-img.png";
export default function HeaderAndHero() {
  const categories = [
    { title: "More Fun Together", text: "Lighthearted questions to spark laughter and joy." },
    { title: "Adventure Together", text: "Explore curiosity, risk, and new experiences." },
    { title: "Strengthen Trust", text: "Build honesty, safety, and deeper understanding." },
    { title: "Feel More Appreciated", text: "Express gratitude and feel truly seen." },
    { title: "Add Some Spice", text: "Playful and flirty questions to reconnect." },
    { title: "Healing & Rebuilding", text: "Gentle prompts for hard conversations." },
    { title: "Healing & Rebuilding test", text: "Gentle prompts for hard conversations." },
    { title: "Healing & Rebuilding", text: "Gentle prompts for hard conversations." },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollPrev(scrollLeft > 1);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const scrollPrev = () => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector('div');
    const cardWidth = card ? card.offsetWidth : 300;
    const gap = 24;
    scrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector('div');
    const cardWidth = card ? card.offsetWidth : 300;
    const gap = 24;
    scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      checkScroll();
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      ref?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <>
      <div className="relative pb-24 md:pb-40 bg-white">
        <Header />

        {/* HERO SECTION */}
        <section
          className="relative pt-28 md:pt-32 pb-16 md:pb-24 px-5 sm:px-8 overflow-hidden"
          style={{
            background: `linear-gradient(
              to bottom,
              #fff3eb 0%,
              #fff3eb 30%,
              #ffd2b8 60%,
              #FF7E3D 100%
            )`,
          }}
        >
          {/* Wave background */}
          <div
            className="absolute inset-0 opacity-30 md:opacity-40 pointer-events-none"
            style={{
              backgroundImage: `url(${tetherlineone})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center center",
            }}
          />

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Rating + Heading + Subtitle + Buttons ... (unchanged) */}
            <div className="flex items-center gap-2.5 mb-6 md:mb-8">
              <img src={Stars} alt="4.8 star rating" className="h-5 md:h-6" />
              <span className="text-sm md:text-base font-medium text-gray-800">
                <span className="text-[#F57123] font-semibold">4.8</span> • 1k+ Users
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 mb-6 md:mb-8">
              The app that’s{" "}
              <span className="text-[#FF7E3D] italic font-semibold">pulling</span>
              <br className="sm:hidden" /> couples closer together.
            </h1>

            <p className="text-lg md:text-xl text-gray-800 max-w-3xl mb-10 md:mb-12 leading-relaxed">
              Some questions are simply easier to answer than to ask. Tether creates a shared
              moment that will keep you close when life tries its best to pull you apart.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 md:gap-6 mb-16 md:mb-20">
              <img
                src={Applestore}
                alt="Download on the App Store"
                className="h-12 md:h-14 w-auto object-contain cursor-pointer hover:opacity-90 transition"
              />
              <img
                src={Googlestore}
                alt="Get it on Google Play"
                className="h-12 md:h-14 w-auto object-contain cursor-pointer hover:opacity-90 transition"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center relative z-10 max-w-5xl mx-auto px-4">
            {[
              ["Set a Rhythm", "Choose how often questions appear in your week."],
              ["10+ Categories", "Free users start with two categories."],
              ["1k+ Questions", "Updated regularly for different moments."],
              ["Draw Another", "Skip and redraw together anytime."],
            ].map(([title, desc], i) => (
              <div key={i} className="px-2">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
                  {title}
                </h3>
                <p className="text-sm md:text-base text-gray-800 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES SLIDER */}
       <section
          className="relative pt-28 md:pt-32 px-5 sm:px-8 overflow-hidden"
          style={{
            background: `linear-gradient(
              to bottom,
              #fff3eb 0%,
              #fff3eb 30%,
              #ffd2b8 60%,
              #FF7E3D 100%
            )`,
          }}
        >
          <div className="text-center mb-8 md:mb-10">

            <p className="mt-1.5 max-w-4xl mx-auto text-xl sm:text-2xl md:text-4xl  text-gray-900">
              Choose from thousands of questions across our categories that have been crafted for.{" "}
              <span className="text-[#FF7E3D] font-bold">every kind of couple</span>
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20 lg:w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20 lg:w-24 bg-gradient-to-l from-white to-transparent z-10" />

            <div
              ref={scrollRef}
              className="
                flex gap-5 sm:gap-6 md:gap-7 lg:gap-8 
                overflow-x-auto snap-x snap-mandatory scroll-smooth pb-10 md:pb-12
                -mx-4 sm:-mx-6 lg:-mx-8
                pl-[12vw] sm:pl-[15vw] md:pl-[20vw] lg:pl-[22vw]
                pr-[12vw] sm:pr-[15vw] md:pr-[20vw] lg:pr-[22vw]
                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
              "
            >
              {categories.map((item, index) => (
                <div
                  key={index}
                  className="
                    snap-center flex-shrink-0 
                    w-[240px] xs:w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px]
                    bg-white rounded-2xl md:rounded-3xl 
                    border border-[#FF7E3D]/20 hover:border-[#FF7E3D]/50
                    p-5 sm:p-6 md:p-7 lg:p-8 
                    text-center 
                    shadow-[0_4px_16px_rgba(255,126,61,0.08)] 
                    hover:shadow-[0_12px_32px_rgba(255,126,61,0.14)]
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:scale-[1.02]
                  "
                >
                  <h4 className="text-[#FF7E3D] font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-3 md:mb-4">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-6 md:gap-10 mt-4 md:mt-6">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="bg-white shadow-md hover:bg-gray-50 rounded-full p-3 sm:p-4 text-[#FF7E3D] text-xl sm:text-2xl font-bold transition-all hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                aria-label="Previous category"
              >
                ←
              </button>

              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="bg-white shadow-md hover:bg-gray-50 rounded-full p-3 sm:p-4 text-[#FF7E3D] text-xl sm:text-2xl font-bold transition-all hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                aria-label="Next category"
              >
                →
              </button>
            </div>
          </div>
          <div className="max-w-5xl mx-auto text-center">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
      
      {/* LEFT: Phone / Image mockup */}
      <div className="relative mx-auto md:mx-0 max-w-[300px] sm:max-w-[300px] md:max-w-[420px] order-2 md:order-1">
       
<img src={PhoneIcon} alt="Phone displaying the app" className="w-full h-auto rounded-3xl shadow-lg" />
      
      </div>

      {/* RIGHT: Text content */}
      <div className="text-center md:text-left order-1 md:order-2">
        <h2 className="text-3xl sm:text-4xl md:text-4xl  text-gray-900 mb-5 md:mb-7 leading-tight">
          Tether was designed to surface the things you both wonder <span className="text-[#fff]">but just never ask.</span>
        </h2>

      

        
      </div>
    </div>

          
          </div>
          
        </section>
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#fffaf5] to-[#ffe8d8] overflow-hidden">
  <div className="max-w-6xl mx-auto px-5 sm:px-8 relative min-h-[700px] md:min-h-[900px]">

    {/* 1 CARD – TOP CENTER */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg md:max-w-xl z-10">
      <div className="bg-[#FF7E3D]/90 text-white rounded-2xl p-6 shadow-xl transform rotate-[-1.5deg] hover:rotate-0 transition">
        <p className="text-base md:text-lg font-medium leading-relaxed text-center">
          One day I want us to finally plan that trip we always talk about but never do. Somewhere quiet, watching the northern lights...
        </p>
      </div>
    </div>

    {/* 1 CARD – LEFT TOP */}
    <div className="absolute top-24 md:top-32 left-4 md:left-8 w-64 md:w-80 z-10">
      <div className="bg-[#FF7E3D]/90 text-white rounded-2xl p-5 shadow-xl transform -rotate-4 hover:rotate-0 transition">
        <p className="text-sm md:text-base font-medium leading-relaxed">
          I need you to stay with me when I am overwhelmed, not wait until I have calmed myself down.
        </p>
      </div>
    </div>

    {/* 1 CARD – RIGHT TOP */}
    <div className="absolute top-28 md:top-40 right-4 md:right-12 w-64 md:w-80 z-10">
      <div className="bg-[#FF7E3D]/90 text-white rounded-2xl p-5 shadow-xl transform rotate-5 hover:rotate-0 transition">
        <p className="text-sm md:text-base font-medium leading-relaxed">
          Buy me a set of handcuffs... I want you to step in with the kids without me feeling guilty about it.
        </p>
      </div>
    </div>

    {/* CENTER TEXT BOX – middle of the section */}
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="px-8 py-10 md:py-12 max-w-lg md:max-w-2xl text-center mx-4">
        <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
          You both get space to think and your answers stay hidden until you<br className="hidden sm:block" />
          <span className="text-[#FF7E3D]">both meet in the middle.</span>
        </p>
      </div>
    </div>

    {/* 1 CARD – LEFT BOTTOM */}
    <div className="absolute bottom-24 md:bottom-32 left-6 md:left-10 w-72 md:w-80 z-10">
      <div className="bg-[#FF7E3D]/90 text-white rounded-2xl p-5 shadow-xl transform rotate-[-3deg] hover:rotate-0 transition">
        <p className="text-sm md:text-base font-medium leading-relaxed">
          Leaving your location on when you go out with your friends
        </p>
      </div>
    </div>

    {/* 1 CARD – RIGHT BOTTOM */}
    <div className="absolute bottom-20 md:bottom-28 right-6 md:right-12 w-72 md:w-80 z-10">
      <div className="bg-[#FF7E3D]/90 text-white rounded-2xl p-5 shadow-xl transform rotate-4 hover:rotate-0 transition">
        <p className="text-sm md:text-base font-medium leading-relaxed">
          I really want us to start planning date nights again when I feel at my worst
        </p>
      </div>
    </div>

    {/* 1 CARD – BOTTOM CENTER */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg md:max-w-xl z-10">
      <div className="bg-[#FF7E3D]/90 text-white rounded-2xl p-6 shadow-xl transform rotate-[1.5deg] hover:rotate-0 transition">
        <p className="text-base md:text-lg font-medium leading-relaxed text-center">
          I imagine us standing somewhere quiet but plan us to be curious together again instead of always being busy how
        </p>
      </div>
    </div>

  </div>
</section>
<section className="relative py-16 md:py-24 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-[#fffaf5] via-[#ffe8d8] to-[#fff3eb] overflow-hidden">
  <div className="max-w-4xl mx-auto">
    {/* Title */}
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12 md:mb-16">
      Frequently Asked <span className="text-[#FF7E3D]">Questions</span>
    </h2>

    {/* FAQ Accordion */}
    <div className="">
      {/* Question 1 - Closed */}
      <details className="group bg-white shadow-md border border-gray-200 overflow-hidden">
        <summary className="flex justify-between items-center cursor-pointer p-6 md:p-7 text-lg md:text-xl font-semibold text-gray-900 hover:text-[#FF7E3D] transition">
          What is Tether?
          <span className="text-[#FF7E3D] text-2xl group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-700 text-base leading-relaxed">
          Tether is an app designed for couples to answer thoughtful, intimate questions together — helping you stay emotionally connected even when life gets busy.
        </div>
      </details>

      {/* Question 2 - OPEN by default with orange highlight */}
      <details open className="group bg-[#FF7E3D]/10 rounded-xl shadow-lg border border-[#FF7E3D]/30 overflow-hidden">
        <summary className="flex justify-between items-center cursor-pointer p-6 md:p-7 text-lg md:text-xl font-semibold text-[#FF7E3D]">
          How do Tether questions work?
          <span className="text-[#FF7E3D] text-2xl group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-800 text-base leading-relaxed bg-white/60">
          Both partners answer the same question, separately. Answers stay hidden until you've both responded, so there's no pressure, no one going first, and no guessing what the other person meant. When both answers unlock, you see the full picture together.
        </div>
      </details>

      {/* Question 3 */}
      <details className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <summary className="flex justify-between items-center cursor-pointer p-6 md:p-7 text-lg md:text-xl font-semibold text-gray-900 hover:text-[#FF7E3D] transition">
          How often do we get questions?
          <span className="text-[#FF7E3D] text-2xl group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-700 text-base leading-relaxed">
          You set the rhythm — daily, every few days, or weekly. Questions appear gently in your notifications when you're both ready.
        </div>
      </details>

      {/* Question 4 */}
      <details className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <summary className="flex justify-between items-center cursor-pointer p-6 md:p-7 text-lg md:text-xl font-semibold text-gray-900 hover:text-[#FF7E3D] transition">
          Is Tether private?
          <span className="text-[#FF7E3D] text-2xl group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-700 text-base leading-relaxed">
          Yes — completely. Your answers are end-to-end encrypted and only visible to you and your partner. We never store or share them.
        </div>
      </details>

      {/* Question 5 */}
      <details className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <summary className="flex justify-between items-center cursor-pointer p-6 md:p-7 text-lg md:text-xl font-semibold text-gray-900 hover:text-[#FF7E3D] transition">
          Is Tether right for every kind of couple?
          <span className="text-[#FF7E3D] text-2xl group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-700 text-base leading-relaxed">
          It's built for couples at any stage — new relationships, long-term partners, or those rebuilding connection. Questions adapt to fun, deep, spicy, or healing moments.
        </div>
      </details>

      {/* Question 6 */}
      <details className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <summary className="flex justify-between items-center cursor-pointer p-6 md:p-7 text-lg md:text-xl font-semibold text-gray-900 hover:text-[#FF7E3D] transition">
          What do we get for free?
          <span className="text-[#FF7E3D] text-2xl group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-700 text-base leading-relaxed">
          Free users get access to two categories, a selection of questions, and the core "hidden until both answer" mechanic. Premium unlocks all categories and more frequent questions.
        </div>
      </details>

      {/* Question 7 */}
      <details className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <summary className="flex justify-between items-center cursor-pointer p-6 md:p-7 text-lg md:text-xl font-semibold text-gray-900 hover:text-[#FF7E3D] transition">
          Do both partners need to pay?
          <span className="text-[#FF7E3D] text-2xl group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 md:px-7 pb-6 md:pb-7 text-gray-700 text-base leading-relaxed">
          No — only one partner needs a premium subscription. The other can join for free and still participate fully in shared questions.
        </div>
      </details>
    </div>

    {/* Optional CTA below FAQs */}
    <div className="text-center mt-12 md:mt-16">
      <button className="bg-[#FF7E3D] text-white font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-[#e56a2f] transition transform hover:scale-105">
        Start Pulling Each Other Closer Now
      </button>
    </div>
  </div>
</section>
<footer className="relative bg-gradient-to-b from-[#fff3eb] to-[#FF7E3D] pt-16 pb-12 px-5 sm:px-8 lg:px-12 text-center overflow-hidden">
  {/* Decorative subtle wave or overlay if desired */}
  <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="absolute bottom-0 left-0 w-full h-32 bg-white/20 blur-3xl" />
  </div>

  <div className="relative max-w-6xl mx-auto z-10">
    {/* Main CTA Section */}
    <div className="mb-16 md:mb-20">
      <div className="flex justify-center items-center gap-3 mb-6">
        <div className="text-5xl md:text-6xl font-bold text-[#FF7E3D]">
          ♥
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Tether
        </h2>
      </div>

      <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
        Start pulling each other closer now
      </h3>

      <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
        Download the app today and begin answering premium questions for free.
      </p>

      <button className="bg-white text-[#FF7E3D] font-semibold text-lg px-10 py-4 rounded-full shadow-lg border-2 border-[#FF7E3D] hover:bg-[#FF7E3D] hover:text-white transition transform hover:scale-105">
        Download the App
      </button>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-300/50 max-w-4xl mx-auto mb-12" />

    {/* Footer Links Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 text-left sm:text-center">
      {/* Site Links */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Site</h4>
        <ul className="space-y-3 text-gray-700">
          <li><a href="#" className="hover:text-[#FF7E3D] transition">Home</a></li>
          <li><a href="#" className="hover:text-[#FF7E3D] transition">About</a></li>
          <li><a href="#" className="hover:text-[#FF7E3D] transition">FAQs</a></li>
          <li><a href="#" className="hover:text-[#FF7E3D] transition">Download</a></li>
        </ul>
      </div>

      {/* Support Links */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Support</h4>
        <ul className="space-y-3 text-gray-700">
          <li><a href="#" className="hover:text-[#FF7E3D] transition">Contact Us</a></li>
          <li><a href="#" className="hover:text-[#FF7E3D] transition">Terms of Service</a></li>
          <li><a href="#" className="hover:text-[#FF7E3D] transition">Privacy Policy</a></li>
        </ul>
      </div>

      {/* Social Links */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Social</h4>
        <ul className="space-y-3 text-gray-700">
          <li>
            <a href="#" className="flex items-center justify-center sm:justify-start gap-2 hover:text-[#FF7E3D] transition">
              Instagram
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center justify-center sm:justify-start gap-2 hover:text-[#FF7E3D] transition">
              Facebook
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* Optional small copyright */}
    <div className="mt-12 text-sm text-gray-600">
      © {new Date().getFullYear()} Tether. All rights reserved.
    </div>
  </div>
</footer>
      </div>

      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}