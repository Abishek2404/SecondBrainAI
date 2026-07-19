const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

file = file.replace(/import \{ Brain.*?lucide-react";/, `import { Brain, Filter, MoreVertical, Search, Trash, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Clock, Target, Trophy, Flame, GraduationCap, ClipboardList, Play, Check, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { Badge } from "./ui/badge";`);

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched imports");
