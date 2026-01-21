import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-extrabold tracking-tighter text-2xl text-[#fa43ad]">
                SWIFT FOOD
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed font-light">
              Designing the future of large-scale event catering. Minimalist ops
              for high-impact experiences.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-black">
              Company
            </h4>
            <ul className="space-y-4 text-sm text-gray-500 font-light">
              <li>
                <Link href="/menu" className="hover:text-black transition-colors">
                  Our Menus
                </Link>
              </li>
              <li>
                <Link href="/event-order" className="hover:text-black transition-colors">
                  Event Ordering
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-black transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/restaurant/dashboard" className="hover:text-black transition-colors">
                  Restaurant Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-black">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-gray-500 font-light">
              <li>
                <a
                  href="mailto:swiftfooduk@gmail.com"
                  className="hover:text-black transition-colors"
                >
                  swiftfooduk@gmail.com
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/swiftfood_uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors flex items-center gap-2"
                >
                  <Image
                    src="/socials/instagram.png"
                    width={16}
                    height={16}
                    alt="Instagram"
                  />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/swiftfooduk/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors flex items-center gap-2"
                >
                  <Image
                    src="/socials/linkedin.png"
                    width={16}
                    height={16}
                    alt="LinkedIn"
                  />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-100 pt-10 text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">
          <p>&copy; {new Date().getFullYear()} SWIFT FOOD UK. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
