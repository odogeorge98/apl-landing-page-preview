import { Button } from "@/components/ui/Button";
import { CTASection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface FooterSectionProps extends CTASection {
  className?: string;
}

export function FooterSection({
  title,
  subtitle,
  buttonText,
  buttonAction,
  className,
}: FooterSectionProps) {
  return (
    <div
      className={cn(
        "py-10 mt-40 md:mt-auto h-auto md:h-[558px] flex flex-col",
        className
      )}
      style={{
        backgroundImage: "url('/assets/backgrounds/footer.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Main content area */}
      <div className="flex-1 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-10 md:py-24">
          <div className="mb-8">
            <motion.h2 
            className="text-3xl sm:text-2xl lg:text-5xl font-normal md:font-bold mb-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true
            }}
            transition={{
                duration: .3,
                ease: "linear",
            }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p 
              className="w-[90%] md:w-[400px] mx-auto text-[16px] text-zinc-400"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true
              }}
              transition={{
                  duration: .3,
                  ease: "linear",
                  delay: .25
              }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true
          }}
          transition={{
            duration: .3,
            ease: "linear",
            delay: .5
          }}
          >
            {/* <input
              type="email"
              placeholder="Enter your company email"
              className="w-[90%] md:w-auto flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            /> */}
            <Button
              onClick={buttonAction}
              className="w-[90%] md:w-[max-content] cursor-pointer bg-[#5F3DF4] hover:bg-[#4c31c4] text-white px-8 py-0 md:py-3 rounded-lg font-medium"
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>
      </div>

      <footer className="h-auto md:h-[100px] flex md:items-center text-gray-400">
        <div className="w-[90%] lg:w-6xl mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 border-t-[#3D3D3D] border-t-2 py-6 md:py-4">
          <div className="text-sm text-zinc-300">
            © {new Date().getFullYear()} PEPP Cruise. All Rights Reserved.
          </div>
          <div className="pt-4 md:pt-0 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 text-sm">
            <Link href="#" className="hover:text-white text-zinc-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white text-zinc-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white text-zinc-500 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
