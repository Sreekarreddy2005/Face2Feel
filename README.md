# 🧠 Face2Feel: Affective Learning Environment

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Edge AI](https://img.shields.io/badge/Architecture-Edge_AI-brightgreen?style=for-the-badge)
![HCI](https://img.shields.io/badge/HCI-Adaptive_UI-blue?style=for-the-badge)

An advanced Human-Computer Interaction (HCI) system that utilizes real-time facial expression recognition to dynamically adapt a digital learning interface to the user's cognitive state. Built entirely on the client-side (Edge AI) to guarantee zero latency and complete data privacy.

Inspired by the research concepts in *"Face2Feel: Emotion-Aware Adaptive User Interface"*.

---

## ✨ Key Features & HCI Interventions

The system continuously monitors the user's affective state and triggers specific architectural layout changes based on cognitive load:

* **🟢 Peak Flow (Happy/Engaged):** The user is responding well. The system recommends high-difficulty tasks (e.g., Deep Work, Complex Algorithms) and utilizes a vibrant, engaging color palette to maintain momentum.
* **⚪ Baseline (Neutral):** Standard grid layout with complex navigation sidebars and standard typography available.
* **🔵 Cognitive De-escalation (Frustrated/Angry):** The user is experiencing high cognitive load. The system actively reduces visual clutter by hiding complex navigation, shifts to a calming blue color palette, and downgrades the recommended task to low-friction review work.
* **🟡 Fatigue Support (Sad/Tired):** Visual acuity drops when fatigued. The system dynamically increases global font sizes by 25%, shifts to a warm yellow background to reduce eye strain, and recommends passive learning modalities.
* **⚙️ User Agency Engine:** Users can override system defaults (e.g., customizing de-escalation colors or locking the layout), adhering to the core HCI principle of maintaining human-in-the-loop control.

---

## 🏗️ System Architecture & Process Flow

This project utilizes a custom **Edge AI** architecture. Rather than relying on cloud-based API calls or a heavy Python backend, the entire machine learning inference pipeline is executed locally within the browser's JavaScript runtime.

### The Technical Pipeline:

1. **WebRTC Video Ingestion:** The application securely requests local webcam permissions and streams a live, mirrored video feed into an optimized HTML5 video element.
2. **Local ML Inference Engine:**
   Utilizing compiled neural network weights loaded directly into the client, the system analyzes the video feed at high-frequency intervals. It calculates exact probability vectors for multiple facial expressions simultaneously.
3. **State Mapping & Smoothing:**
   To prevent erratic UI flickering caused by micro-expressions, the raw AI output is passed through a smoothing function and grouped into four distinct macro-states (`neutral`, `happy`, `frustrated`, `fatigued`).
4. **Dynamic UI Re-rendering:**
   React's state management listens for macro-state shifts. When a threshold is crossed, the virtual DOM instantly updates CSS-in-JS properties, altering the layout structure, typography, and learning content without requiring a page reload.

---

## 🚀 Setup & Deployment

To run this project locally, ensure you have Node.js installed on your machine.

### 1. Initialize the Environment
Clone the repository and install the core dependencies:
```bash
git clone <your-repo-url>
cd Face2Feel-Project/frontend
npm install

### 2. Verify ML Model Weights
This Edge AI architecture requires its neural network weights to be served statically. Ensure that the compiled model shard files and manifest JSONs are present in the following directory before booting the server:
public/models/

### 3. Launch the Application
Start the local development server:

Bash
npm run dev
Navigate to http://localhost:5173. Note: You must grant browser permissions for webcam access for the inference engine to boot up.

### 🧪 Evaluation & Testing Protocol
**To verify the real-time HCI adaptations, position yourself in front of the active webcam and perform the following state tests:**

** Verify Connection: Ensure the subtitle says "AI Engine Active" and check the bottom-right video feed for the green debug output. **

** Test Baseline: Maintain a relaxed face. The UI should display the standard dashboard.**

** Test Engagement: Smile clearly at the camera. The UI will shift to green and recommend a "Peak Flow" task. **

** Test Frustration: Furrow your brows and frown. The sidebar will disappear, the background will turn blue, and the task will change to "Review". **

** Test Fatigue: Droop your eyes and look sad. The font size will noticeably increase, and the background will warm up. **

##👨‍💻 Author
Sreekar Reddy Pindi
Suhas Bajjuri
Harikaran
