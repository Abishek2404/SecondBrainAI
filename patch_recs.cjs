const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldRecs = `    if (recs.length === 0) {
       recs.push({
          title: 'Start a new Quiz',
          description: "You're all caught up on your tasks! Test your knowledge by taking a new quiz.",
          time: '15 min',
          impact: 'Low Impact',
          icon: <BrainCircuit className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
          link: '/quizzes'
       });
       recs.push({
          title: 'Review Recent Documents',
          description: "Read through your recent uploads to solidify your understanding of the material.",
          time: '20 min',
          impact: 'Medium Impact',
          icon: <FileText className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
          link: '/documents'
       });
    }

    return recs;`;

const newRecs = `    if (recs.length < 3) {
       const defaults = [
         {
            title: 'Start a new Quiz',
            description: "Test your knowledge by taking a new quiz.",
            time: '15 min',
            impact: 'Low Impact',
            icon: <BrainCircuit className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
            link: '/quizzes'
         },
         {
            title: 'Review Recent Documents',
            description: "Read through your recent uploads to solidify your understanding of the material.",
            time: '20 min',
            impact: 'Medium Impact',
            icon: <FileText className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
            link: '/documents'
         },
         {
            title: 'Plan Your Week',
            description: "Set up a study plan to keep your streak going.",
            time: '10 min',
            impact: 'High Impact',
            icon: <CalendarDays className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
            link: '/planner'
         }
       ];
       
       for (const def of defaults) {
         if (recs.length >= 3) break;
         if (!recs.some(r => r.title === def.title)) {
           recs.push(def);
         }
       }
    }

    return recs;`;

code = code.replace(oldRecs, newRecs);
fs.writeFileSync('src/components/Dashboard.tsx', code);
