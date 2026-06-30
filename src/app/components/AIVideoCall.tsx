import { useState, useRef, useEffect, useCallback } from "react";
import {
    Mic, MicOff, MonitorUp, PhoneOff,
    MessageSquare, Camera, ChevronRight, AlertTriangle, Wifi, WifiOff
} from "lucide-react";
import { Glass, cn } from "./UI";

interface AIVideoCallProps {
    aiName: string;
    aiAvatar: string;
    aiColor: string;
    onMessage: (text: string) => void;
    aiMessage: string;
    isAiSpeaking: boolean;
    onEndCall: () => void;
    muted?: boolean;
    onToggleMute?: () => void;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export default function AIVideoCall({
    aiName,
    aiAvatar,
    aiColor,
    onMessage,
    aiMessage,
    isAiSpeaking,
    onEndCall,
    muted = false,
    onToggleMute,
}: AIVideoCallProps) {
    const [cameraOn, setCameraOn] = useState(false);
    const [screenShare, setScreenShare] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
    const [callDuration, setCallDuration] = useState(0);
    const [aiAnimation, setAiAnimation] = useState("idle");
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [screenShareError, setScreenShareError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLVideoElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Timer
    useEffect(() => {
        const id = setInterval(() => {
            setCallDuration((d) => d + 1);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // Simulate connection
    useEffect(() => {
        const t1 = setTimeout(() => setConnectionStatus("connected"), 800);
        return () => clearTimeout(t1);
    }, []);

    // AI speaking animation
    useEffect(() => {
        if (isAiSpeaking) {
            setAiAnimation("speaking");
            const t = setTimeout(() => setAiAnimation("idle"), 2500);
            return () => clearTimeout(t);
        }
    }, [isAiSpeaking, aiMessage]);

    // Cleanup streams on unmount
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach((t) => t.stop());
            }
        };
    }, [localStream]);

    // Camera toggle
    const toggleCamera = useCallback(async () => {
        setCameraError(null);
        if (cameraOn && localStream) {
            localStream.getTracks().forEach((t) => t.stop());
            setLocalStream(null);
            setCameraOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user",
                    },
                    audio: !muted,
                });
                setLocalStream(stream);
                setCameraOn(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (err: any) {
                const message = err.name === "NotAllowedError"
                    ? "Camera permission denied. Please allow camera access in your browser settings."
                    : err.name === "NotFoundError"
                        ? "No camera found on your device."
                        : "Failed to access camera: " + err.message;
                setCameraError(message);
                setCameraOn(false);
            }
        }
    }, [cameraOn, localStream, muted]);

    // Screen share
    const toggleScreenShare = useCallback(async () => {
        setScreenShareError(null);
        if (screenShare) {
            const tracks = (screenRef.current?.srcObject as MediaStream)?.getTracks();
            tracks?.forEach((t) => t.stop());
            setScreenShare(false);
            if (screenRef.current) screenRef.current.srcObject = null;
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always",
                    } as MediaTrackConstraints,
                    audio: false,
                });
                setScreenShare(true);
                if (screenRef.current) {
                    screenRef.current.srcObject = stream;
                    await screenRef.current.play();
                }
                stream.getVideoTracks()[0]?.addEventListener("ended", () => {
                    setScreenShare(false);
                    if (screenRef.current) screenRef.current.srcObject = null;
                });
            } catch (err: any) {
                const message = err.name === "NotAllowedError"
                    ? "Screen sharing permission cancelled."
                    : "Failed to share screen: " + err.message;
                setScreenShareError(message);
                setScreenShare(false);
            }
        }
    }, [screenShare]);

    const sendChat = () => {
        if (!chatMessage.trim()) return;
        setChatHistory((h) => [...h, { role: "user", text: chatMessage }]);
        onMessage(chatMessage);
        setChatMessage("");
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-full">
            {/* Main video area */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
                {/* Connection status bar */}
                <div className={cn(
                    "flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium transition-all",
                    connectionStatus === "connected" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" :
                        connectionStatus === "connecting" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                            connectionStatus === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                    <div className="flex items-center gap-2">
                        {connectionStatus === "connected" ? <Wifi size={14} /> :
                            connectionStatus === "connecting" ? <WifiOff size={14} className="animate-pulse" /> :
                                <AlertTriangle size={14} />}
                        <span>
                            {connectionStatus === "connected" ? "Connected to AI interviewer" :
                                connectionStatus === "connecting" ? "Establishing connection..." :
                                    connectionStatus === "error" ? "Connection lost. Reconnecting..." :
                                        "Disconnected"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        {formatDuration(callDuration)}
                    </div>
                </div>

                {/* Video grid */}
                <div className={cn(
                    "relative flex-1 rounded-[20px] overflow-hidden",
                    "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
                    "border border-slate-700/50 min-h-[300px]"
                )}>
                    {/* AI Avatar */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={cn(
                                "w-28 h-28 mx-auto rounded-full flex items-center justify-center text-5xl",
                                "bg-gradient-to-br border-4 transition-all duration-500",
                                aiAnimation === "speaking"
                                    ? "border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.4)] scale-110"
                                    : "border-white/20 shadow-lg",
                                aiColor
                            )}>
                                {aiAvatar}
                            </div>
                            <h3 className="text-white font-semibold mt-3 text-lg">{aiName}</h3>
                            <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                                {isAiSpeaking ? (
                                    <>
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        Speaking...
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full" />
                                        Listening
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* User camera picture-in-picture */}
                    {cameraOn && (
                        <div className="absolute bottom-4 right-4 w-44 h-32 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl bg-black">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Screen share overlay */}
                    {screenShare && (
                        <div className="absolute inset-0 z-10 bg-black">
                            <video ref={screenRef} autoPlay playsInline className="w-full h-full object-contain" />
                            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-semibold flex items-center gap-2">
                                <MonitorUp size={12} />
                                Screen Sharing
                            </div>
                        </div>
                    )}

                    {/* Error messages */}
                    {cameraError && (
                        <div className="absolute bottom-20 left-4 right-4">
                            <div className="bg-red-500/90 backdrop-blur-xl rounded-xl px-4 py-2.5 text-white text-xs flex items-start gap-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>{cameraError}</span>
                            </div>
                        </div>
                    )}

                    {screenShareError && (
                        <div className="absolute top-4 left-4 right-4">
                            <div className="bg-red-500/90 backdrop-blur-xl rounded-xl px-4 py-2.5 text-white text-xs flex items-start gap-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>{screenShareError}</span>
                            </div>
                        </div>
                    )}

                    {/* AI transcript overlay */}
                    {aiMessage && (
                        <div className={cn(
                            "absolute bottom-4 left-4 right-4 max-w-lg mx-auto",
                            "bg-slate-900/90 backdrop-blur-xl rounded-2xl px-5 py-3.5",
                            "border border-slate-700/50 transition-all duration-300",
                            isAiSpeaking ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"
                        )}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm shrink-0">
                                    AI
                                </div>
                                <p className="text-white/90 text-sm leading-relaxed">{aiMessage}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Control bar */}
                <Glass className="flex items-center justify-center gap-3 p-3 rounded-[16px]">
                    <button
                        onClick={toggleCamera}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                            cameraOn
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        )}
                        title={cameraOn ? "Turn off camera" : "Turn on camera"}
                    >
                        {cameraOn ? <Camera size={18} /> : <VideoOffIcon />}
                    </button>

                    {onToggleMute && (
                        <button
                            onClick={onToggleMute}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                                muted
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            )}
                            title={muted ? "Unmute microphone" : "Mute microphone"}
                        >
                            {muted ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    )}

                    <button
                        onClick={toggleScreenShare}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                            screenShare
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                        title={screenShare ? "Stop sharing" : "Share screen"}
                    >
                        <MonitorUp size={18} />
                    </button>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                            showChat
                                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                        title="Open chat"
                    >
                        <MessageSquare size={18} />
                    </button>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

                    <button
                        onClick={onEndCall}
                        className="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
                        title="End call"
                    >
                        <PhoneOff size={18} />
                    </button>
                </Glass>
            </div>

            {/* Chat panel */}
            {showChat && (
                <Glass className="w-full lg:w-80 flex flex-col overflow-hidden rounded-[20px] max-h-[500px] lg:max-h-none">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} className="text-blue-500" />
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Live Chat</span>
                        </div>
                        <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {chatHistory.length === 0 && (
                            <div className="text-center text-slate-400 text-sm py-8">
                                <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                                <p>Type a message to chat with the AI recruiter</p>
                            </div>
                        )}
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={cn(
                                "flex gap-2",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-blue-500 text-white rounded-tr-md"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-md"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 border-t border-slate-200 dark:border-slate-700/50">
                        <div className="flex gap-2">
                            <input
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                                placeholder="Type your answer..."
                                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200 dark:border-slate-700/50"
                            />
                            <button
                                onClick={sendChat}
                                disabled={!chatMessage.trim()}
                                className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </Glass>
            )}
        </div>
    );
}

function VideoOffIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8" />
            <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10Z" />
            <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
    );
}