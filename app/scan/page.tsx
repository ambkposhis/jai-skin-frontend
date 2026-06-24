"use client";

import { useEffect, useRef, useState } from "react";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const [predictions, setPredictions] = useState<any[]>([]);
  const [skinScore, setSkinScore] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [assessment, setAssessment] = useState("Analyzing...");
  const [faceBox, setFaceBox] = useState<any>(null);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndPredict();
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {

  if (!overlayRef.current) return;
  if (!videoRef.current) return;

  const canvas = overlayRef.current;
  const video = videoRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!faceBox) return;

  ctx.strokeStyle = "#00ff66";
  ctx.lineWidth = 4;

  ctx.strokeRect(
    faceBox.x,
    faceBox.y,
    faceBox.w,
    faceBox.h
  );

  }, [faceBox]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function captureAndPredict() {
    if (!videoRef.current || !canvasRef.current) return;

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
            "http://127.0.0.1:8000/predict",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await response.json();

         console.log("API RESPONSE:", data);

          setPredictions(data.top3 || []);
          setSkinScore(data.skin_score || 0);
          setFaceDetected(data.face_detected || false);
          setAssessment(data.assessment || "Analyzing...");
          setFaceBox(data.face_box || null);

        } catch (err) {
          console.error(err);
        }
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-black text-white p-8">

      <div className="mb-10">
      <div className="flex items-center gap-4">

        <h1 className="text-7xl font-bold">
          J'ais
        </h1>

        <div className="flex items-center gap-2 mt-3">

          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

          <span className="text-green-300">
            Live Scan
          </span>

        </div>

      </div>

        <p className="text-green-300 text-xl mt-2 tracking-[0.35em]">
          a i c e 's specialist
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-5 shadow-2xl">
        <p className="text-green-300 text-xl mb-4">
            Live Camera Feed
        </p>
        <div className="relative">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-2xl"
          />
        
          <canvas
            ref={overlayRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
      
        </div>
        </div>

        <div className="space-y-6">

          <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-6 shadow-2xl">
            <p className="text-green-300 text-lg">
              Skin Score
            </p>


            <h2 className="text-7xl font-bold mt-2">
              {skinScore}
            </h2>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-6 shadow-2xl">

            <p className="text-green-300 text-lg mb-2">
              Face Status
            </p>

            <div className="text-2xl font-bold">
              {faceDetected ? (
                <span className="text-green-400">
                  🟢 Face Detected
                </span>
              ) : (
                <span className="text-red-400">
                  🔴 No Face Detected
                </span>
              )}
            </div>

          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-6 shadow-2xl">

            <p className="text-green-300 text-lg mb-2">
              Overall Assessment
            </p>

            <h2 className="text-3xl font-bold text-white">
              {assessment}
            </h2>

          </div>          

          <div className="backdrop-blur-xl bg-white/10 border border-green-400/20 rounded-3xl p-6 shadow-2xl">

            <h2 className="text-3xl font-bold text-green-300 mb-6">
              Analysis Results
            </h2>

            <div className="space-y-5">

              {predictions.map((item, index) => (
                <div key={index}>

                  <div className="flex justify-between mb-2">
                    <span className="capitalize">
                      {item.label}
                    </span>

                    <span>
                      {item.confidence}%
                    </span>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-4">

                <div
                  className={`h-4 rounded-full ${
                    item.confidence > 80
                      ? "bg-green-500"
                      : item.confidence > 50
                      ? "bg-lime-400"
                      : item.confidence > 20
                      ? "bg-yellow-400"
                      : "bg-orange-400"
                  }`}
                  style={{
                    width: `${item.confidence}%`,
                  }}
                />

                  </div>

                </div>
              ))}

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
