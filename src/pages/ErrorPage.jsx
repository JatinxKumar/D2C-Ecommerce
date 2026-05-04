// import { useLocation, Link, useNavigate } from 'react-router-dom';
// import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ErrorPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Try to parse error details from query params
//   const searchParams = new URLSearchParams(location.search);
//   const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
  
//   const errorCode = searchParams.get('error') || hashParams.get('error');
//   const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

//   // Determine if it's a 404 or a specific error
//   const is404 = location.pathname !== '/error' && !errorCode;
  
//   const title = is404 ? "404 - Page Not Found" : "Oops! Something went wrong.";
//   const description = is404 
//     ? "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
//     : errorDesc 
//       ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
//       : "We encountered an unexpected error while processing your request. Please try again.";

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
//       >
//         <div className={`p-8 md:p-12 text-center ${is404 ? 'bg-orange-50' : 'bg-red-50'}`}>
//           <div className="flex justify-center mb-6">
//             <div className={`w-24 h-24 rounded-full flex items-center justify-center ${is404 ? 'bg-orange-100 text-[#d97706]' : 'bg-red-100 text-red-500'} shadow-inner`}>
//               {is404 ? (
//                 <span className="text-4xl font-bold">404</span>
//               ) : (
//                 <AlertTriangle size={48} />
//               )}
//             </div>
//           </div>
          
//           <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
//             {title}
//           </h1>
          
//           <p className="text-gray-600 font-medium mb-8 leading-relaxed">
//             {description}
//           </p>
          
//           {errorCode === 'server_error' && (
//              <div className="bg-red-100/50 border border-red-200 text-red-800 text-xs p-3 rounded-lg mb-8 text-left overflow-x-auto font-mono">
//                <strong>Technical Details:</strong><br/>
//                {errorCode}
//              </div>
//           )}

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//             <button 
//               onClick={() => navigate(-1)}
//               className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
//             >
//               <RotateCcw size={18} /> Go Back
//             </button>
//             <Link 
//               to="/"
//               className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#d97706] hover:bg-[#c26a05] text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg active:scale-95"
//             >
//               <Home size={18} /> Return Home
//             </Link>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default ErrorPage;



import { motion } from 'framer-motion';
import { Settings, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-5 font-sans overflow-hidden relative">
      
      {/* 🌌 Animated Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"
      />

      <div className="relative z-10 text-center max-w-2xl">
        
        {/* ⚙️ High-Animation Icon Section */}
        <div className="relative flex justify-center mb-10">
          {/* Rotating Gear 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="text-slate-700 opacity-20"
          >
            <Settings size={180} strokeWidth={1} />
          </motion.div>

          {/* Floating Main Icon */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.4)]">
              <ShieldAlert size={64} className="text-white" />
            </div>
          </motion.div>
        </div>

        {/* 📝 Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            System <span className="text-blue-500">Tune-up</span> in Progress
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-md mx-auto">
            Our servers are taking a quick breather to serve you better. We'll be back online in a flash!
          </p>
        </motion.div>

        {/* 🔘 Interactive Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => window.location.reload()}
            className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            Try Refreshing
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-700 transition-all hover:bg-slate-700 hover:text-white"
          >
            Go to Homepage
          </button>
        </motion.div>

        {/* 🕵️ Hidden Tech Details (Developer Friendly) */}
        <p className="mt-12 text-slate-600 text-xs font-mono opacity-40 hover:opacity-100 transition-opacity cursor-default">
          Error Node: SRV-57P01-FATAL | Shivani Mart Core
        </p>
      </div>
    </div>
  );
};

export default ProErrorPage;