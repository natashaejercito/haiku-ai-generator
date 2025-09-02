import React, { useState, useCallback } from "react";
import { Info, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const HaikuGenerator = () => {
  const [input, setInput] = useState("");
  const [haiku, setHaiku] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");

  const API_CONFIG = {
    endpoint:
      import.meta.env.VITE_API_ENDPOINT ||
      "https://cloudaicompanion.googleapis.com",
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    model: import.meta.env.VITE_MODEL || "gemini-2.5-flash",
  };

  const generateHaikuFromAPI = async (theme) => {
    try {
      setError("");
      setIsGenerating(true);

      if (!API_CONFIG.apiKey) {
        throw new Error(
          "Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file."
        );
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(API_CONFIG.apiKey);
      const model = genAI.getGenerativeModel({ model: API_CONFIG.model });

      const prompt = `Write a traditional haiku (5-7-5 syllables) about "${theme}". 
                     Return only the haiku, with each line on a separate line. 
                     Make it beautiful and evocative.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedHaiku = response.text().trim();

      setHaiku(generatedHaiku);
    } catch (err) {
      console.error("Error generating haiku:", err);

      if (err.message.includes("429") || err.message.includes("rate limit")) {
        console.log("Using fallback generation due to rate limit");
      } else {
        setError(err.message || "Failed to generate haiku. Please try again.");
      }

      generateFallbackHaiku(theme);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackHaiku = (theme) => {
    const fallbackHaikus = [
      `${theme} whispers soft\nIn morning's gentle embrace\nPeace fills the warm air`,
      `Dancing with ${theme}\nNature's rhythm guides my heart\nMoments become gold`,
      `${theme} speaks to me\nThrough silence of the old trees\nWisdom flows like streams`,
    ];

    const randomHaiku =
      fallbackHaikus[Math.floor(Math.random() * fallbackHaikus.length)];
    setHaiku(randomHaiku);
  };

  const handleGenerate = useCallback(async () => {
    const theme = input.trim();
    if (!theme) {
      setError("Please enter a word or theme for your haiku.");
      return;
    }

    if (API_CONFIG.apiKey) {
      await generateHaikuFromAPI(theme);
    } else {
      setIsGenerating(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      generateFallbackHaiku(theme);
      setIsGenerating(false);
    }
  }, [input, API_CONFIG.apiKey]);

  const handleSampleClick = (word) => {
    setInput(word);
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  const sampleWords = [
    "sunset",
    "ocean",
    "dream",
    "hope",
    "love",
    "rain",
    "spring",
    "joy",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-100 to-rose-200">
      {/* Mobile container */}
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header*/}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-black mb-2 sm:mb-4">
            H<span className="text-pink-400 font-sans font-normal">AI</span>KU
          </h1>
          <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-700 px-4">
            Turn your ideas into poetic art
          </h2>
        </header>

        {/* Content card */}
        <div className="bg-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {/* Input section */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg sm:text-xl font-medium text-gray-700 font-serif flex items-center gap-2">
                  Your Haiku inspiration
                  {/* Info button*/}
                  <div className="relative">
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      aria-label="Information"
                    >
                      <Info size={20} />
                    </button>

                    {/* Responsive Info popup */}
                    {showInfo && (
                      <div className="absolute top-8 right-10 sm:right-auto sm:left-0 bg-gray-700 text-pink-300 text-sm rounded-lg p-4 shadow-lg z-10 w-80 max-w-[calc(100vw-2rem)] font-serif">
                        <h3 className="mb-2">How to use:</h3>
                        <ul className="space-y-1">
                          <li>• Each poem follows 5-7-5 syllable pattern</li>
                          <li>• Enter any word, emotion, or concept</li>
                          <li>
                            • Try words like "sunset", "love", "dream", etc.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Input and button*/}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a word of your choice"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all text-base"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !input.trim()}
                  className="px-6 py-3 bg-pink-400 text-white rounded-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[120px] text-base font-medium"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span className="hidden sm:inline">
                        Creating Haiku...
                      </span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle
                  className="text-red-500 flex-shrink-0 mt-0.5"
                  size={16}
                />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Generated haiku*/}
            {haiku && (
              <div className="mb-6 p-6 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg border border-rose-200 text-center ">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 font-serif">
                  Your Haiku:
                </h3>
                <div className="text-lg sm:text-xl lg:text-2xl text-gray-800 leading-relaxed font-serif whitespace-pre-line italic text-center ">
                  {haiku}
                </div>
              </div>
            )}
          </div>

          {/* Sample words section */}
          <div className="border-t bg-gray-50 p-6 sm:p-8">
            <p className="text-gray-600 mb-4 text-sm sm:text-base font-serif">
              Try these sample words:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {sampleWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(word)}
                  disabled={isGenerating}
                  className="px-3 py-2 bg-pink-50 text-black-700 rounded-full hover:bg-pink-100 transition-colors capitalize text-sm sm:text-base border border-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with API status */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Developed using Gemini API ©{" "}
            <a
              href="https://natashaejercito.vercel.app/"
              className="text-pink-500 text-decoration: underline hover:text-pink-600 font-medium"
              target="_blank"
            >
              Natasha
            </a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HaikuGenerator;
