import { useState } from "react";

export default function VoiceInput({ onResult }) {
const [listening, setListening] = useState(false);

const startListening = () => {
const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
alert("Speech Recognition is not supported in this browser.");
return;
}

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

setListening(true);
recognition.start();

recognition.onresult = (event) => {
const transcript = event.results[0][0].transcript;
onResult(transcript);
setListening(false);
};

recognition.onerror = (event) => {
console.error("Speech recognition error:", event.error);
setListening(false);
alert("Voice input failed. Please try again.");
};

recognition.onend = () => {
setListening(false);
};
};

return (
<button
onClick={startListening}
disabled={listening}
className={`mt-2 px-4 py-2 rounded text-white ${
listening ? "bg-gray-500" : "bg-green-600"
}`}
>
{listening ? "🎙️ Listening..." : "🎙️ Speak Answer"}
</button>
);
}
