const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldCard = `        {/* Learning Streak Card */}
        <motion.div whileHover={{ y: -2 }} className="rounded-2xl border bg-[#1A1A1A] text-white p-6 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="absolute -right-4 -bottom-4 opacity-80 pointer-events-none">
             <div className="w-24 h-24 bg-orange-500 rounded-full blur-[40px]" />
          </div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <img src="/learning-streak.svg" alt="Streak" className="h-5 w-5 object-contain" />
            <span className="font-semibold text-sm">Learning Streak</span>
          </div>
          <div className="relative z-10 flex flex-col">
             <div className="flex items-baseline gap-1">
               <span className="text-5xl font-bold tracking-tighter">{currentStreakVal}</span>
               <span className="text-gray-400 font-medium text-sm">days</span>
             </div>
             <div className="text-gray-400 text-xs mt-2">
               Best: {longestStreakVal} days
             </div>
          </div>
          <img src="/learning-streak.svg" alt="Learning Streak" className="absolute -bottom-2 -right-2 h-24 w-24 object-contain pointer-events-none drop-shadow-md" />
        </motion.div>`;

const newCard = `        {/* Learning Streak Card */}
        <motion.div whileHover={{ y: -2 }} className="rounded-[24px] border border-[#2A2A2A] bg-[#111111] text-white p-6 relative overflow-hidden flex flex-col shadow-lg">
          <div className="flex items-center gap-2.5 mb-4 relative z-10">
            <img src="/learning-streak.svg" alt="Streak" className="h-6 w-6 object-contain" />
            <span className="font-bold text-[15px] text-[#F3F4F6] tracking-wide">Learning Streak</span>
          </div>
          <div className="relative z-10 flex flex-col mt-2">
             <div className="flex items-baseline gap-2">
               <span className="text-[64px] leading-none font-extrabold tracking-tight">{currentStreakVal}</span>
               <span className="text-[#A1A1AA] font-semibold text-lg">days</span>
             </div>
             <div className="text-[#F3F4F6] text-[15px] font-medium mt-6">
               Best: {longestStreakVal} days
             </div>
          </div>
          <img src="/learning-streak.svg" alt="Learning Streak" className="absolute bottom-2 right-4 h-[120px] w-[120px] object-contain pointer-events-none drop-shadow-2xl" />
        </motion.div>`;

code = code.replace(oldCard, newCard);
fs.writeFileSync('src/components/Dashboard.tsx', code);
