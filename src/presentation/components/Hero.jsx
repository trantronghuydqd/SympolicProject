import { useState, useEffect } from "react";

const Hero = () => {
    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = [
        "https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/symbolicv3/banner.jpg",
        "https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/symbolicv3/banner1.png",
        "https://gbfowokbikzhjqqdhgjr.supabase.co/storage/v1/object/public/symbolicv3/banner2.png",
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const nextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
    };

    const prevBanner = () => {
        setCurrentBanner(
            (prev) => (prev - 1 + banners.length) % banners.length,
        );
    };

    return (
        <div className="relative w-full aspect-[1875/685] overflow-hidden">
            <img
                src={banners[currentBanner]}
                alt="Symbolic Banner"
                className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Nút điều hướng */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
                <button
                    onClick={prevBanner}
                    className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                <button
                    onClick={nextBanner}
                    className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentBanner(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            currentBanner === index ? "bg-white" : "bg-white/50"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
