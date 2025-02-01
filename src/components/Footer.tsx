import { motion } from "framer-motion"

const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-800 text-white py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left">
            <h3 className="text-lg font-semibold">TeachPlatform</h3>
            <p className="mt-2 text-sm">Empowering education through technology</p>
          </div>
          <div className="w-full md:w-1/3 mt-4 md:mt-0">
            <ul className="flex justify-center md:justify-end space-x-6">
              <li>
                <a href="#" className="hover:text-gray-300 transition duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition duration-300">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition duration-300">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} TeachPlatform. All rights reserved.
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer

