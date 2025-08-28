"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const footerLinks = {
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/#about" },
    { label: "Rebrand Challenge", href: "/signup" },
  ],
};

const socialLinks = [
  { Icon: FaFacebook, href: "https://www.facebook.com/share/173jPb1P73/" },
  {
    Icon: FaXTwitter,
    href: "https://x.com/concesofficial?t=l3hLqtzs5ZHcgBrUV0PfNw&s=09",
  },
  {
    Icon: FaInstagram,
    href: "https://www.instagram.com/concesofficial?igsh=MXZ4aW5wb2Q5M2IxNg==",
  },
  {
    Icon: FaYoutube,
    href: "https://youtube.com/@concesofficial",
  },
  {
    Icon: FaTiktok,
    href: "https://www.tiktok.com/@concesofficial?_t=ZS-8zDzAKrmNYj&_r=1",
  },
  {
    Icon: FaLinkedin,
    href: "https://www.linkedin.com/in/concesofficial?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
  },
];

export default function Footer() {
  return (
    <footer className="bg-conces-blue text-white pt-12 pb-6 md:pt-16 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <div className="text-2xl font-bold mb-4">CONCES</div>
            <p className="text-white/70 mb-5 text-sm md:text-base leading-relaxed">
              Empowering students through faith-centered education and community
              support.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <social.Icon
                    className="w-5 h-5 md:w-6 md:h-6"
                    aria-label={`Follow us on ${social.Icon.name}`}
                  />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-4 md:mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-white/70 hover:text-white transition-colors text-sm md:text-base block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="sm:col-start-1 lg:col-start-3"
          >
            <h4 className="text-lg font-bold mb-4 md:mb-5">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3 text-conces-green text-sm"></i>
                <span className="text-white/70 text-sm md:text-base">
                  goodnews@conces.org
                </span>
              </li>

              <li className="flex items-start">
                <i className="fas fa-location-dot mt-1 mr-3 text-conces-green text-sm"></i>
                <span className="text-white/70 text-sm md:text-base">
                  CONCES Headquarters, Abuja, Nigeria
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
        
            className="text-white/70 hover:text-white transition-colors text-sm md:text-base"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
