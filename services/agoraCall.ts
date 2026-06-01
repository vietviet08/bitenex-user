import { PermissionsAndroid, Platform } from "react-native";

let engine: any | null = null;

async function requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== "android") {
        return true;
    }

    const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
}

function getAgoraModule(): any {
    // Native module is available only in development/production native builds.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-agora");
}

export async function joinAgoraVoiceChannel({
    appId,
    channelName,
    token,
    uid,
    onRemoteJoined,
    onRemoteOffline,
}: {
    appId: string;
    channelName: string;
    token: string;
    uid: number;
    onRemoteJoined?: () => void;
    onRemoteOffline?: () => void;
}): Promise<void> {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
        throw new Error("Microphone permission is required for calls.");
    }

    const agora = getAgoraModule();
    const nextEngine = agora.createAgoraRtcEngine();
    nextEngine.initialize({ appId });
    nextEngine.enableAudio();
    nextEngine.setEnableSpeakerphone(true);
    nextEngine.addListener("onUserJoined", onRemoteJoined ?? (() => undefined));
    nextEngine.addListener("onUserOffline", onRemoteOffline ?? (() => undefined));
    nextEngine.joinChannel(token, channelName, uid, {
        publishMicrophoneTrack: true,
        autoSubscribeAudio: true,
    });
    engine = nextEngine;
}

export function setAgoraMuted(isMuted: boolean): void {
    engine?.muteLocalAudioStream(isMuted);
}

export function setAgoraSpeakerEnabled(isEnabled: boolean): void {
    engine?.setEnableSpeakerphone(isEnabled);
}

export function leaveAgoraVoiceChannel(): void {
    if (!engine) {
        return;
    }

    engine.leaveChannel();
    engine.removeAllListeners();
    engine.release();
    engine = null;
}
