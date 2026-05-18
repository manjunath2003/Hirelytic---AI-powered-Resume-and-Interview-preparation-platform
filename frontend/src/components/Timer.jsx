import { useEffect, useState } from "react";

export default function Timer({ seconds, onTimeout }) {
const [time, setTime] = useState(seconds);

// 🔁 Reset timer when seconds prop changes (new question)
useEffect(() => {
setTime(seconds);
}, [seconds]);

// ⏱️ Countdown logic
useEffect(() => {
if (time <= 0) {
onTimeout();
return;
}

const id = setTimeout(() => {
setTime((t) => t - 1);
}, 1000);

return () => clearTimeout(id);
}, [time, onTimeout]);

return (
<p className="text-red-600 font-semibold">
⏱️ Time Left: {time}s
</p>
);
}
