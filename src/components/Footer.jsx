// import React from 'react';
// import { motion, useScroll, useTransform } from 'framer-motion';
// import { Mail, Phone, MapPin, ShieldCheck, Heart, Sparkles, ShoppingBag } from 'lucide-react';

// const Footer = () => {
//   const { scrollYProgress } = useScroll();
//   const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]); // Reduced intensity for stability

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20, scale: 0.98 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: { type: 'spring', stiffness: 80, damping: 20 }
//     }
//   };

//   return (
//     <footer className="relative bg-[#010409] pt-32 pb-16 overflow-hidden">
//       {/* Background Layer */}
//       <motion.div
//         style={{ y: parallaxY }}
//         className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none select-none opacity-[0.03]"
//       >
//         <h2 className="text-[20vw] font-black tracking-tighter leading-none text-white">SHIVANI</h2>
//       </motion.div>

//       {/* Decorative Glows */}
//       <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
//       <div className="absolute -top-32 right-0 w-[500px] h-96 bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />

//       <div className="max-w-7xl mx-auto px-4 relative z-10">
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-5"
//         >
//           {/* Main Branding Card */}
//           <motion.div
//             variants={cardVariants}
//             className="md:col-span-4 lg:col-span-6 bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-700 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-orange-500/20 glass-premium"
//           >
//             <div className="absolute inset-0 noise-bg" />
//             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
//               <ShoppingBag size={150} strokeWidth={0.5} />
//             </div>

//             <div className="relative z-10 h-full flex flex-col justify-between">
//               <div>
//                 <div className="flex items-center gap-4 mb-8">
//                   <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-black text-3xl border border-white/30">S</div>
//                   <h2 className="text-3xl font-black tracking-tight uppercase">Shivani<span className="text-yellow-200">Mart</span></h2>
//                 </div>
//                 <p className="text-blue-50 text-xl font-medium leading-relaxed max-w-lg mb-8 italic">
//                   Serving Rajpura with premium quality and trust since 2000.
//                 </p>
//               </div>

//               <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest leading-none">
//                 <span className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-colors"><ShieldCheck size={16} className="text-yellow-500" /> Quality Verified</span>
//                 <span className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-colors"><Heart size={16} className="text-orange-500" /> Community First</span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Status Card */}
//           <motion.div
//             variants={cardVariants}
//             className="md:col-span-2 lg:col-span-3 bg-white/[0.02] border border-white/10 rounded-[40px] p-10 flex flex-col justify-between glass-premium"
//           >
//             <div>
//               <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Service Status</h3>
//               <div className="flex items-center gap-4">
//                 <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(250,204,21,0.5)]" />
//                 <span className="text-2xl font-black text-white">OPEN NOW</span>
//               </div>
//               <p className="text-gray-500 text-xs font-bold mt-4">7:00 AM - 10:00 PM (Daily)</p>
//             </div>
//             <a href="tel:+919501493742" className="mt-8 p-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-center text-[11px] tracking-[0.2em] rounded-2xl transition-all uppercase shadow-lg shadow-yellow-500/20 active:scale-95">
//               Call Support
//             </a>
//           </motion.div>

//           {/* Local Pride Card */}


//           {/* Links & Payments */}
//           <motion.div
//             variants={cardVariants}
//             className="md:col-span-4 lg:col-span-12 bg-white/[0.01] border border-white/10 rounded-[40px] p-12 glass-premium"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
//               <div>
//                 <h3 className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Quick Links</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   {['Home', 'Shop', 'Orders', 'Profile', 'Cart', 'Offers'].map(l => (
//                     <a key={l} href={`/${l.toLowerCase()}`} className="text-gray-500 hover:text-white font-bold text-sm transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-yellow-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> {l}</a>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Contact Info</h3>
//                 <div className="space-y-4">
//                   <p className="text-white font-black text-xl tracking-tight flex items-center gap-2"> <Phone size={18} className="text-yellow-500" /> +91 9501493742</p>
//                   <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-widest flex items-start gap-2"> <MapPin size={16} className="text-yellow-500 shrink-0" /> Dalima Vihar, Main Market, Rajpura</p>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Secure Payments</h3>
//                 <div className="flex flex-wrap gap-4">
//                   {/* UPI */}
//                   <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2 group hover:border-[#F7931A]/30 transition-colors">
//                     <svg viewBox="0 0 24 24" width="16" height="16" className="fill-white"><path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
//                     <span className="text-[9px] font-black text-white/40 group-hover:text-white transition-colors uppercase">UPI</span>
//                   </div>
//                   {/* Visa */}
//                   <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2 group hover:border-[#1A1F71]/30 transition-colors">
//                     <svg viewBox="0 0 24 24" width="16" height="16" className="fill-[#1A1F71]"><path d="M10 16c-2.208 0-4-1.792-4-4s1.792-4 4-4 4 1.792 4 4-1.792 4-4 4zm0-6c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z"/><path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.002 12H4z"/></svg>
//                     <span className="text-[9px] font-black text-white/40 group-hover:text-white transition-colors uppercase">VISA</span>
//                   </div>
//                   {/* Mastercard */}
//                   <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2 group hover:border-[#EB001B]/30 transition-colors">
//                     <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="9" cy="12" r="5" fill="#EB001B" fillOpacity="0.8"/><circle cx="15" cy="12" r="5" fill="#F79E1B" fillOpacity="0.8"/></svg>
//                     <span className="text-[9px] font-black text-white/40 group-hover:text-white transition-colors uppercase">Card</span>
//                   </div>
//                   {/* Paytm */}
//                   <div className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2 group hover:border-[#00BAF2]/30 transition-colors">
//                     <svg viewBox="0 0 24 24" width="16" height="16" className="fill-[#00BAF2]"><circle cx="12" cy="12" r="10"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
//                     <span className="text-[9px] font-black text-white/40 group-hover:text-white transition-colors uppercase">Paytm</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>

//         <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
//           <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-center md:text-left">
//             <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">© 2024 SHIVANI MART</p>
//             <div className="h-4 w-px bg-white/5 hidden md:block" />
//             <p className="text-gray-500 text-[10px] font-bold tracking-widest">MADE WITH <span className="text-red-500 animate-pulse">❤️</span> IN RAJPURA</p>
//           </div>
//           <div className="flex gap-4">
//             <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-600 hover:text-yellow-500 border border-transparent hover:border-yellow-500/20 transition-all">
//               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
//             </a>
//             <a href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-600 hover:text-blue-500 border border-transparent hover:border-blue-500/20 transition-all">
//               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Heart,
  ShoppingBag,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-[#030507] text-white pt-28 pb-14 overflow-hidden">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[250px] bg-orange-500/10 blur-[100px]" />
      </div>

      {/* WATERMARK TEXT */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
        <h1 className="text-[18vw] font-black tracking-tight">SHIVANI</h1>
      </div>

      <div className="max-w-7xl mx-auto px-5 relative z-10">

        {/* 🔥 GRID */}
        <div className="grid md:grid-cols-3 gap-10">

          {/* BRAND */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                <ShoppingBag size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Shivani<span className="text-yellow-500">Mart</span>
              </h2>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Premium grocery & essentials store serving Rajpura with trust,
              quality and fast delivery experience.
            </p>

            <div className="flex gap-3">
              <span className="flex items-center gap-2 text-xs bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                <ShieldCheck size={14} className="text-yellow-500" />
                Verified Quality
              </span>

              <span className="flex items-center gap-2 text-xs bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                <Heart size={14} className="text-red-500" />
                Trusted Local
              </span>
            </div>
          </motion.div>

          {/* LINKS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-xs uppercase tracking-[0.3em] text-yellow-500 mb-6 font-bold">
              Quick Links
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {["Home", "Shop", "Orders", "Cart", "Profile", "Offers"].map(
                (item) => (
                  <a
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </motion.div>

          {/* CONTACT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5"
          >
            <h3 className="text-xs uppercase tracking-[0.3em] text-yellow-500 font-bold">
              Contact
            </h3>

            <div className="space-y-3 text-sm text-gray-400">

              <p className="flex items-center gap-2">
                <Phone size={16} /> +91 9501493742
              </p>

              <p className="flex items-center gap-2">
                <MapPin size={16} />
                Dalima Vihar, Rajpura
              </p>

              <a
                href="https://wa.me/919501493742"
                target="_blank"
                className="flex items-center gap-2 hover:text-green-400 transition group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                </svg>
                WhatsApp Chat
              </a>

            </div>

            <a
              href="tel:+919501493742"
              className="inline-block mt-4 px-5 py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 transition"
            >
              Call Now
            </a>
          </motion.div>
        </div>

        {/* 🔥 BOTTOM */}
        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2024 ShivaniMart. All rights reserved.</p>
          <p>
            Made with <span className="text-red-500">❤️</span> in Rajpura
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;