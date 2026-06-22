"use client";

import { useEffect, useRef, useState } from "react";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [predictions, setPredictions] = useState<any[]>([]);
  const [skinScore, setSkinScore] = useState<number>(0);

  const [pigmentation, setPigmentation] =
    useState<any>(null);

  const [assessment, setAssessment] =
    useState("");

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndPredict();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const startCamera = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const captureAndPredict = async () => {
    if (!videoRef.current || !canvasRef.current)
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        const formData = new FormData();

        formData.append(
          "file",
          blob,
          "frame.jpg"
        );

        try {
          const response = await fetch(
            "https://allen-bk-jai-skin-analyzer.hf.space/predict",
            {
              method: "POST",
              body: formData,
            }
          );

          const data =
            await response.json();

          setPredictions(
            data.top3 || []
          );

          setSkinScore(
            data.skin_score || 0
          );

          setPigmentation(
            data.pigmentation || null
          );

          setAssessment(
            data.assessment || ""
          );

        } catch (error) {
          console.error(error);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-black text-white p-4 md:p-8">

      <div className="mb-10">
        <h1 className="text-4xl md:text-7xl font-bold">
          J'ais
        </h1>

        <p className="text-green-300 text-sm md:text-xl mt-2 tracking-[0.35em]">
          a i c e ' s specialist
        </p>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-8">

	  {/* LEFT PANEL */}
	  <div className="lg:sticky lg:top-6 self-start">
	
	    <div className="relative backdrop-blur-2xl bg-white/10 border border-white/10 rounded-3xl p-5 shadow-2xl">
	
	      <video
	        ref={videoRef}
	        autoPlay
	        playsInline
	        className="w-full rounded-2xl scale-x-[-1]"
	      />
	
	      <div className="mt-4 flex items-center gap-2">
	        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
	        <span className="text-green-300">
	          Live AI Analysis
	        </span>
	      </div>
	
	      <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-3">
	        📷 Face Detected
	      </div>
	
	    </div>
	
	  </div>
	
	  {/* RIGHT PANEL */}
	  <div className="space-y-6">
	
	    {/* SKIN SCORE */}
	    <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-6 shadow-2xl">
	
	      <p className="text-green-300 text-lg">
	        Skin Score
	      </p>
	
	      <div className="flex items-center justify-center">
	        <div className="relative w-56 h-56 rounded-full border-[12px] border-green-400 flex items-center justify-center">
	
	          <div className="text-center">
	            <p className="text-6xl font-bold">
	              {skinScore}
	            </p>
	
	            <p className="text-green-300 text-sm">
	              Skin Score
	            </p>
	          </div>
	
	        </div>
	      </div>
	
	    </div>
	
	    {/* ANALYSIS RESULTS */}
	    <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-6 shadow-2xl">
	
	      <h2 className="text-3xl font-bold text-green-300 mb-6">
	        Analysis Results
	      </h2>
	
	      <div className="space-y-4 mb-8">
	
	        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
	
	          <p className="text-green-300">
	            Assessment
	          </p>
	
	          <h3 className="text-2xl font-bold">
	            {assessment}
	          </h3>
	
	        </div>
	
	        {pigmentation && (
	
	          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
	
	            <p className="text-green-300">
	              Pigmentation Level
	            </p>
	
	            <h3 className="text-2xl font-bold">
	              {pigmentation.level}
	            </h3>
	
	            <p className="mt-2">
	              Confidence: {pigmentation.confidence}%
	            </p>
	
	          </div>
	
	        )}
	
	      </div>
	
	      <div className="grid gap-3">
	
	        {predictions.map((item, index) => (
	
	          <div
	            key={index}
	            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center"
	          >
	
	            <div>
	              <p className="capitalize text-lg">
	                {item.label}
	              </p>
	
	              <p className="text-green-300 text-sm">
	                Skin Analysis
	              </p>
	            </div>
	
	            <div className="text-right">
	              <p className="text-2xl font-bold">
	                {item.confidence}%
	              </p>
	            </div>
	
	          </div>
	
	        ))}
	
	      </div>
	
	    </div>
	
	    {/* RECOMMENDATIONS */}
	    <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-6 shadow-2xl">
	
	      <h2 className="text-2xl font-bold text-green-300 mb-4">
	        Recommendations
	      </h2>
	
	      <div className="grid gap-3">
	
	        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
	          ☀ SPF Daily
	        </div>
	
	        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
	          💧 Stay Hydrated
	        </div>
	
	        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
	          🌙 Night Repair
	        </div>
	
	        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
	          🧴 Moisturize
	        </div>
	
	      </div>
	
	    </div>
	
	  </div>
	
	</div>
	<canvas
	  ref={canvasRef}
	  className="hidden"
	/>

	</main>
	);
}
