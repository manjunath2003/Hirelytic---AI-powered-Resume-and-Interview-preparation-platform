import { motion } from "framer-motion";

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-800 to-indigo-800 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-6"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
          className="w-28 h-28 rounded-full border-4 border-white border-t-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg font-semibold tracking-wide"
        >
          Loading Dashboard…
        </motion.p>
      </motion.div>
    </div>
  );
}
