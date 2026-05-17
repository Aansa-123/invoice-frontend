import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export const TypingEffect = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const textIndex = useMotionValue(0);
  const baseText = useTransform(textIndex, (latest) => texts[index].slice(0, Math.round(latest)));
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(textIndex, texts[index].length, {
      type: "tween",
      duration: 1.5,
      ease: "easeInOut",
      onComplete: () => {
        setTimeout(() => {
          animate(textIndex, 0, {
            type: "tween",
            duration: 1,
            ease: "easeInOut",
            onComplete: () => {
              setIndex((prev) => (prev + 1) % texts.length);
            },
          });
        }, 2000);
      },
    });
    return controls.stop;
  }, [index, texts, textIndex]);

  return (
    <span className="inline-block min-h-[1.2em]">
      <motion.span>{baseText}</motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block w-[2px] h-[0.9em] bg-cyan-400 ml-1 translate-y-1"
      />
    </span>
  );
};
