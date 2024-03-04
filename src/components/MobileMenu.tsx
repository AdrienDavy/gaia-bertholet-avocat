import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
};

export const MobileMenu = ({ children }: Props) => {
  const [toggle, setToggle] = useState(false);

  return (
    <div>
      <div
        // className={`text-3xl text-blue-light fixed right-5 top-5 cursor-pointer z-50 ${toggle && `hidden`}`}
        className="space-y-2 fixed right-5 top-5 cursor-pointer z-50  p-1 rounded-md bg-gray-100/20"
        onClick={() => setToggle((prevToggle) => !prevToggle)}
      >
        {/* <FontAwesomeIcon icon={faBars} /> */}
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
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 25 }}
          exit={{ opacity: 0, x: 25 }}
          className="flex justify-center items-center fixed top-0 right-0 cursor-pointer h-screen overflow-auto w-screen bg-starlight"
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          animate={{ opacity: 0, x: 25 }}
          initial={{ opacity: 1, x: 0 }}
          exit={{ opacity: 1, x: 0 }}
          className="flex justify-center items-center fixed top-0 right-0 cursor-pointer h-screen overflow-auto w-screen bg-starlight"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};
