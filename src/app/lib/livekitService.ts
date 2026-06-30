import { Room, RoomEvent, Track, LocalVideoTrack, LocalAudioTrack, RemoteParticipant, VideoPresets, createLocalVideoTrack, createLocalAudioTrack, type RemoteTrack } from "livekit-client";
import api from "./api";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export interface LiveKitCallbacks {
    onConnectionStateChange: (state: ConnectionState) => void;
    onRemoteVideoTrack: (track: MediaStreamTrack) => void;
    onRemoteAudioTrack: (track: MediaStreamTrack) => void;
    onLocalVideo: (track: LocalVideoTrack) => void;
    onLocalAudio: (track: LocalAudioTrack) => void;
    onError: (error: string) => void;
    onAiSpeaking: (speaking: boolean) => void;
}

class LiveKitService {
    private room: Room | null = null;
    private localVideo: LocalVideoTrack | null = null;
    private localAudio: LocalAudioTrack | null = null;
    private callbacks: LiveKitCallbacks | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private remoteVideoElement: HTMLVideoElement | null = null;
    private remoteAudioElement: HTMLAudioElement | null = null;

    setRemoteVideoElement(el: HTMLVideoElement | null) {
        this.remoteVideoElement = el;
    }

    setRemoteAudioElement(el: HTMLAudioElement | null) {
        this.remoteAudioElement = el;
    }

    async getToken(roomName: string, identity: string): Promise<string> {
        const response = await api.post("/livekit/token", {
            room_name: roomName,
            identity: identity,
        });
        return response.data.token;
    }

    async connect(roomName: string, identity: string, callbacks: LiveKitCallbacks): Promise<void> {
        this.callbacks = callbacks;
        callbacks.onConnectionStateChange("connecting");

        try {
            const token = await this.getToken(roomName, identity);

            this.room = new Room({
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: {
                    resolution: VideoPresets.h720.resolution,
                },
                audioCaptureDefaults: {
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            this.setupRoomListeners();

            const livekitUrl = (import.meta as any).env?.VITE_LIVEKIT_URL || "ws://localhost:7880";
            await this.room.connect(livekitUrl, token);
            callbacks.onConnectionStateChange("connected");
            this.reconnectAttempts = 0;

            // Create and publish local tracks
            await this.createLocalTracks();

        } catch (err: any) {
            console.error("LiveKit connection error:", err);
            callbacks.onConnectionStateChange("error");
            callbacks.onError(err.message || "Failed to connect to interview room");

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.connect(roomName, identity, callbacks), 2000 * this.reconnectAttempts);
            }
        }
    }

    private setupRoomListeners(): void {
        if (!this.room) return;

        this.room.on(RoomEvent.Disconnected, () => {
            this.callbacks?.onConnectionStateChange("disconnected");
        });

        this.room.on(RoomEvent.Reconnecting, () => {
            this.callbacks?.onConnectionStateChange("connecting");
        });

        this.room.on(RoomEvent.Reconnected, () => {
            this.callbacks?.onConnectionStateChange("connected");
        });

        this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
            if (track.kind === "video") {
                this.callbacks?.onRemoteVideoTrack(track.mediaStreamTrack);
                if (this.remoteVideoElement) {
                    this.remoteVideoElement.srcObject = new MediaStream([track.mediaStreamTrack]);
                }
            } else if (track.kind === "audio") {
                this.callbacks?.onRemoteAudioTrack(track.mediaStreamTrack);
                if (this.remoteAudioElement) {
                    this.remoteAudioElement.srcObject = new MediaStream([track.mediaStreamTrack]);
                }
            }
        });

        this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
            if (track.kind === "video" && this.remoteVideoElement) {
                this.remoteVideoElement.srcObject = null;
            } else if (track.kind === "audio" && this.remoteAudioElement) {
                this.remoteAudioElement.srcObject = null;
            }
        });

        this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
            const aiParticipant = Array.from(this.room?.remoteParticipants.values() || [])
                .find((p) => p.identity?.includes("ai"));
            if (aiParticipant) {
                const isSpeaking = speakers.some((s) => s.identity === aiParticipant.identity);
                this.callbacks?.onAiSpeaking(isSpeaking);
            }
        });

        this.room.on(RoomEvent.MediaDevicesError, (error: Error) => {
            this.callbacks?.onError(`Media device error: ${error.message}`);
        });
    }

    private async createLocalTracks(): Promise<void> {
        try {
            this.localVideo = await createLocalVideoTrack({
                resolution: VideoPresets.h720.resolution,
                facingMode: "user",
            });

            this.localAudio = await createLocalAudioTrack({
                autoGainControl: true,
                echoCancellation: true,
                noiseSuppression: true,
            });

            if (this.room) {
                await this.room.localParticipant.publishTrack(this.localVideo);
                await this.room.localParticipant.publishTrack(this.localAudio);
            }

            this.callbacks?.onLocalVideo(this.localVideo);
            this.callbacks?.onLocalAudio(this.localAudio);

        } catch (err: any) {
            if (err.name === "NotAllowedError") {
                this.callbacks?.onError("Camera and microphone access denied. Please allow permissions in your browser settings.");
            } else if (err.name === "NotFoundError") {
                this.callbacks?.onError("No camera or microphone found on your device.");
            } else {
                this.callbacks?.onError(`Failed to create local media: ${err.message}`);
            }
        }
    }

    async toggleCamera(enabled: boolean): Promise<void> {
        if (this.localVideo) {
            await this.localVideo.mute();
            if (enabled) await this.localVideo.unmute();
        } else if (enabled) {
            await this.createLocalTracks();
        }
    }

    async toggleMicrophone(enabled: boolean): Promise<void> {
        if (this.localAudio) {
            await this.localAudio.mute();
            if (enabled) await this.localAudio.unmute();
        }
    }

    async startScreenShare(): Promise<MediaStream | null> {
        if (!this.room) return null;
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" } as MediaTrackConstraints,
                audio: false,
            });

            const screenTrack = new LocalVideoTrack(stream.getVideoTracks()[0]);
            await this.room.localParticipant.publishTrack(screenTrack, {
                source: Track.Source.ScreenShare,
            });

            stream.getVideoTracks()[0].addEventListener("ended", () => {
                this.room?.localParticipant.unpublishTrack(screenTrack);
                screenTrack.stop();
            });

            return stream;
        } catch (err: any) {
            if (err.name !== "NotAllowedError" && err.name !== "AbortError") {
                this.callbacks?.onError(`Screen sharing failed: ${err.message}`);
            }
            return null;
        }
    }

    async switchCamera(deviceId: string): Promise<void> {
        if (this.localVideo) {
            await this.localVideo.restartTrack({
                deviceId: { exact: deviceId },
                resolution: VideoPresets.h720.resolution,
            });
        }
    }

    async switchMicrophone(deviceId: string): Promise<void> {
        if (this.localAudio) {
            await this.localAudio.restartTrack({
                deviceId: { exact: deviceId },
                autoGainControl: true,
                echoCancellation: true,
                noiseSuppression: true,
            });
        }
    }

    async getDevices(): Promise<{ video: MediaDeviceInfo[]; audio: MediaDeviceInfo[] }> {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return {
            video: devices.filter((d) => d.kind === "videoinput"),
            audio: devices.filter((d) => d.kind === "audioinput"),
        };
    }

    isMicrophoneEnabled(): boolean {
        return this.localAudio?.isMuted === false;
    }

    isCameraEnabled(): boolean {
        return this.localVideo?.isMuted === false;
    }

    async disconnect(): Promise<void> {
        if (this.localVideo) {
            this.localVideo.stop();
            this.localVideo = null;
        }
        if (this.localAudio) {
            this.localAudio.stop();
            this.localAudio = null;
        }
        if (this.room) {
            this.room.disconnect();
            this.room = null;
        }
        this.callbacks = null;
        this.reconnectAttempts = 0;
        this.remoteVideoElement = null;
        this.remoteAudioElement = null;
    }
}

export const livekitService = new LiveKitService();
export default livekitService;