import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Settings, BookOpen, Activity, LayoutDashboard } from 'lucide-react';
import * as faceapi from 'face-api.js';

const defaultThemes = {
  neutral: { bg: '#f8fafc', text: '#0f172a', cardBg: '#ffffff', size: '16px', layout: 'grid', showSidebar: true },
  happy: { bg: '#f0fdf4', text: '#14532d', cardBg: '#ffffff', size: '16px', layout: 'grid', showSidebar: true }, // NEW: Happy State
  frustrated: { bg: '#e0f2fe', text: '#082f49', cardBg: '#f0f9ff', size: '18px', layout: 'column', showSidebar: false },
  fatigued: { bg: '#fef3c7', text: '#451a03', cardBg: '#fffbeb', size: '20px', layout: 'column', showSidebar: false }
};

const contentRecommendations = {
  neutral: { title: "Module 4: Advanced Graph Algorithms", type: "Deep Work", difficulty: "High", color: '#3b82f6' },
  happy: { title: "Challenge: Optimize Graph Traversal", type: "Peak Flow State", difficulty: "Very High", color: '#22c55e' }, // NEW: Engaged Task
  frustrated: { title: "Review: Basic Data Structures Flashcards", type: "Review", difficulty: "Low", color: '#10b981' },
  fatigued: { title: "Watch: 5-Minute Video Summary of Graph Theory", type: "Passive Learning", difficulty: "Medium", color: '#f59e0b' }
};

export default function App() {
  const [emotion, setEmotion] = useState('neutral');
  const [rawEmotion, setRawEmotion] = useState('detecting...'); // NEW: Debug state
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('dashboard');
  const [userOverrides, setUserOverrides] = useState({ frustratedColor: '#e0f2fe', disableSidebarHide: false });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; 
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (e) {
        console.error("Failed to load models.", e);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (isModelLoaded) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Webcam error:", err));
    }
  }, [isModelLoaded]);

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (videoRef.current && isModelLoaded) {
        try {
          // FIX: Increased inputSize from 160 to 320 for much better accuracy with glasses
          const detections = await faceapi.detectSingleFace(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }) 
          ).withFaceExpressions();

          if (detections) {
            const expressions = detections.expressions;
            const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
            
            // Show the raw output on the video feed
            setRawEmotion(`${dominantEmotion} (${Math.round(expressions[dominantEmotion] * 100)}%)`);

            // FIX: Explicitly handle the 'happy' emotion
            let groupedEmotion = 'neutral';
            if (['angry', 'disgust', 'fear'].includes(dominantEmotion)) groupedEmotion = 'frustrated';
            else if (dominantEmotion === 'sad') groupedEmotion = 'fatigued';
            else if (dominantEmotion === 'happy') groupedEmotion = 'happy';

            setEmotion(groupedEmotion);

            const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
            setHistory(prev => {
              const newHistory = [...prev, {
                time: elapsed,
                level: groupedEmotion === 'frustrated' ? 3 : groupedEmotion === 'happy' ? 4 : groupedEmotion === 'fatigued' ? 1 : 2
              }];
              return newHistory.slice(-15);
            });
          } else {
            setRawEmotion("No face detected");
          }
        } catch (err) {
          // silent fail
        }
      }
    }, 1000); 
  };

  const currentTheme = { ...defaultThemes[emotion] } || defaultThemes.neutral;
  if (emotion === 'frustrated') currentTheme.bg = userOverrides.frustratedColor;
  if (userOverrides.disableSidebarHide) currentTheme.showSidebar = true;
  const currentContent = contentRecommendations[emotion] || contentRecommendations.neutral;

  const cardStyle = {
    backgroundColor: currentTheme.cardBg,
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    border: '1px solid rgba(0,0,0,0.05)'
  };

  return (
    <div style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, minHeight: '100vh', transition: 'all 0.8s ease', display: 'flex', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* Webcam Preview with Raw Debug Text */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', width: '180px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '3px solid white', zIndex: 1000, backgroundColor: '#000' }}>
        <video 
          ref={videoRef} onPlay={handleVideoPlay} autoPlay muted playsInline
          style={{ width: '100%', height: '120px', objectFit: 'cover', transform: 'scaleX(-1)' }} 
        />
        <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#10b981', padding: '5px', fontSize: '12px', textAlign: 'center', fontFamily: 'monospace' }}>
          AI: {rawEmotion}
        </div>
      </div>

      {currentTheme.showSidebar && (
        <aside style={{ width: '260px', padding: '30px', backgroundColor: currentTheme.cardBg, borderRight: '1px solid rgba(0,0,0,0.05)', boxShadow: '4px 0 15px rgba(0,0,0,0.02)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', margin: '0 0 40px 0' }}><BookOpen size={28} color="#3b82f6"/> LearnOS</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li onClick={() => setView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px', backgroundColor: view === 'dashboard' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: view === 'dashboard' ? '#3b82f6' : 'inherit', fontWeight: view === 'dashboard' ? '600' : '400' }}><LayoutDashboard size={20}/> Dashboard</li>
            <li onClick={() => setView('settings')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', borderRadius: '8px', backgroundColor: view === 'settings' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: view === 'settings' ? '#3b82f6' : 'inherit', fontWeight: view === 'settings' ? '600' : '400' }}><Settings size={20}/> Settings</li>
          </ul>
        </aside>
      )}

      <main style={{ flex: 1, padding: '40px 50px', fontSize: currentTheme.size, display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 30px', ...cardStyle }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>Affective Learning Environment</h1>
            <p style={{ margin: 0, opacity: 0.6, fontSize: '16px', fontWeight: '500' }}>
              {isModelLoaded ? "AI Engine Active (Browser Mode)" : "Loading AI Models..."}
            </p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.6, fontWeight: '700' }}>Current State</div>
            <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '1px', color: emotion === 'frustrated' ? '#ef4444' : emotion === 'fatigued' ? '#f59e0b' : emotion === 'happy' ? '#22c55e' : '#3b82f6' }}>{emotion.toUpperCase()}</div>
          </div>
        </div>

        {view === 'dashboard' && (
          <div style={{ display: currentTheme.layout === 'grid' ? 'grid' : 'flex', gridTemplateColumns: '2fr 1.2fr', flexDirection: 'column', gap: '30px' }}>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Recommended Next Task</h3>
              <p style={{ margin: '0 0 25px 0', opacity: 0.7, fontSize: '15px' }}>Based on your current cognitive load, the system has adjusted your learning path.</p>
              
              <div style={{ padding: '25px', borderRadius: '12px', borderLeft: `6px solid ${currentContent.color}`, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <h2 style={{ margin: '0 0 15px 0', fontSize: '24px' }}>{currentContent.title}</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>Type: {currentContent.type}</span>
                  <span style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>Cognitive Demand: {currentContent.difficulty}</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 25px 0', fontSize: '20px' }}><Activity size={22} color={currentContent.color}/> Emotion History</h3>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tickFormatter={(val) => val === 4 ? 'Happy' : val === 3 ? 'Frust.' : val === 1 ? 'Fatig.' : 'Neut.'} tick={{fontSize: 12, fill: currentTheme.text, opacity: 0.6}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="stepAfter" dataKey="level" stroke={currentContent.color} strokeWidth={3} dot={false} isAnimationActive={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}