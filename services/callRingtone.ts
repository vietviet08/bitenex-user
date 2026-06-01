const INCOMING_CALL_RINGTONE_URI =
    "data:audio/wav;base64,UklGRsQFAABXQVZFZm10IBAAAAABAAEAoA8AAKAPAAABAAgAZGF0YaAFAACAgYB+foKEf3t/hoR6eYSKf3V9i4h2dIaQgG95kI10bYWWg2p0k5RzZ4Och2VulZp0YIChjWJnlqJ3WXumlGBglal6U3Wqm2BXkrCATm2spGFQjbWHTWapqWZNh7WNUGGlrWxMgLSUU1ufsHNLebOaV1eas3lLc7CfW1OUtIBMbK2lYVCNtYdNZqmpZk2HtY1QYaWtbEyAtJRTW5+wc0t5s5pXV5qzeUtzsJ9bU5S0gExsraVhUI21h01mqalmTYe1jVBhpa1sTIC0lFNbn7BzS3mzmldXmrN5S3Own1tTlLSATGytpWFQjbWHTWapqWZNh7WNUGGlrWxMgLSUU1ufsHNLebOaV1eas3lLc7CfW1OUtIBMbK2lYVCNtYdNZqmpZk2HtY1QYaWtbEyAtJRTW5+wc0t5s5pXV5qzeUtzsJ9bU5S0gExsraVhUI21h01mqalmTYe1jVBhpa1sTIC0lFNbn7BzS3mzmldXmrN5S3Own1tTlLSATGytpWFQjbWHTWapqWZNh7WNUGGlrWxMgLSUU1ufsHNLebOaV1eas3lLc7CfW1OUtIBMbK2lYVCNtYdNZqmpZk2HtY1QYaWtbEyAtJRTW5+wc0t5s5pXV5qzeUtzsJ9bU5S0gExsraVhUI21h01mqalmTYe1jVBhpa1sTIC0lFNbn7BzS3mzmldXmrN5S3Own1tTlLSATGytpWFQjbWHTWapqWZNh7WNUGGlrWxMgLSUU1ufsHNLebOaV1eas3lLc7BNdKezjVpMcaW0kF1MbqK1lF9La5+1l2JLaJ21mmVLZZq1nWhLYpe1n2tLX5S1om5MXZC0pXFMWo2zp3RNWIqyqXhOVoexq3tQVIOwrX5RUoCur4JTUH2ssIVVT3mqsohXTnaos4xZTXOmtI9bTHCjtJJeS2yhtZVhS2metZhjS2abtZtmS2OYtZ5pS2GVtaFsS16StKNwTFuPtKZzTVmMs6h2TleIsqp5T1WFsKx9UFOCr66AUlF+rbCDVFB7q7GHVk54qbKKWE10p7ONWkxxpbSQXUxuorWUX0trn7WXYktonbWaZUtlmrWdaEtil7Wfa0tflLWibkxdkLSlcUxajbOndE1YirKpeE5Wh7Gre1BUg7CtflFSgK6vglNQfaywhVVPeaqyiFdOdqizjFlNc6a0j1tMcKO0kl5LbKG1lWFLaZ61mGNLZpu1m2ZLY5i1nmlLYZW1oWxLXpK0o3BMW4+0pnNNWYyzqHZOV4iyqnlPVYWwrH1QU4KvroBSUX6tsINUUHursYdWTnipsopYTXSns41aTHGltJBdTG6itZRfS2uftZdiS2idtZplS2WatZ1oS2KXtZ9rS1+UtaJuTF2QtKVxTFqNs6d0TViKsql4TlaHsat7UFSDsK1+UVKArq+CU1B9rLCFVU95qrKIV052qLOMWU1zprSPW0xwo7SSXktsobWVYUtpnrWYY0tmm7WbZktjmLWeaUthlbWhbEtekrSjcExbj7Smc01ZjLOodk5XiLKqeU9VhbCsfVBTgq+ugFJRfq2wg1RQe6uxh1ZOeKmyilhNdKezjVpMcaW0kF1MbqK1lF9La5+1lmNNaZuymGdQaJeumWtTZ5OrmW9XZ4+omXNaZ4ykmXZeZ4igmHliaIadl3tlaoOZln5pa4KVlH9sbYCSkoFwb3+Pj4Jzcn6LjYJ2dH6IioJ5d36Gh4J8en6DhIF+fX+BgYA=";

type RingtonePlayer = {
    loop: boolean;
    playing: boolean;
    volume: number;
    pause: () => void;
    play: () => void;
    remove: () => void;
};

type ExpoAudioModule = {
    createAudioPlayer: (
        source: { uri: string },
        options?: { keepAudioSessionActive?: boolean },
    ) => RingtonePlayer;
    setAudioModeAsync: (mode: {
        allowsRecording: boolean;
        interruptionMode: "doNotMix" | "duckOthers" | "mixWithOthers";
        playsInSilentMode: boolean;
        shouldPlayInBackground: boolean;
        shouldRouteThroughEarpiece: boolean;
    }) => Promise<void>;
};

let player: RingtonePlayer | null = null;

function getExpoAudio(): ExpoAudioModule | null {
    try {
        // Native module exists only after rebuilding the development/production app.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require("expo-audio") as ExpoAudioModule;
    } catch (error) {
        console.warn(
            "[Call] Ringtone audio module is unavailable. Rebuild the user app dev client.",
            error instanceof Error ? error.message : String(error),
        );
        return null;
    }
}

export async function startIncomingCallRingtone(): Promise<void> {
    if (player?.playing) {
        return;
    }

    const audio = getExpoAudio();
    if (!audio) {
        return;
    }

    await audio.setAudioModeAsync({
        allowsRecording: false,
        interruptionMode: "doNotMix",
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
    });

    player?.remove();
    player = audio.createAudioPlayer({ uri: INCOMING_CALL_RINGTONE_URI }, {
        keepAudioSessionActive: true,
    });
    player.loop = true;
    player.volume = 1;
    player.play();
}

export function stopIncomingCallRingtone(): void {
    if (!player) {
        return;
    }

    player.pause();
    player.remove();
    player = null;
}
