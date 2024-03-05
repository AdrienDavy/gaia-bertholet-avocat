import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
};

export const MobileMenu = ({ children }: Props) => {
  const [toggle, setToggle] = useState(false);

  const variants = {
    open: { opacity: 1, x: 0, display: "flex" },
    closed: { opacity: 0, x: 25, transitionEnd: { display: "none" } },
  };

  return (
    <div>
      <div
        className="space-y-2 fixed right-5 top-5 cursor-pointer z-10 p-1 rounded-md bg-gray-100/20"
        onClick={() => setToggle((prevToggle) => !prevToggle)}
      >
        <motion.span
          animate={{ rotateZ: toggle ? 45 : 0, y: toggle ? 12 : 0 }}
          className="block h-1 w-8 bg-blue-sky"
        ></motion.span>
        <motion.span
          animate={{ opacity: toggle ? 0 : 1 }}
          className="block h-1 w-8 bg-blue-sky"
        ></motion.span>
        <motion.span
          animate={{
            rotateZ: toggle ? -45 : 0,
            y: toggle ? -12 : 0,
          }}
          className="block h-1 w-8 bg-blue-sky"
        ></motion.span>
      </div>
      {!!toggle ? (
        <motion.div
          variants={variants}
          initial="closed"
          animate={toggle ? "open" : "closed"}
          className="flex justify-center items-center fixed top-0 right-0 cursor-pointer h-screen overflow-auto w-screen bg-starlight select-none"
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          variants={variants}
          initial="closed"
          animate={toggle ? "open" : "closed"}
          className="flex justify-center items-center fixed top-0 right-0 cursor-pointer h-screen overflow-hidden w-screen bg-starlight select-none"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};
