const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

const oldFilterBarRegex = /<div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-2 rounded-2xl border shadow-sm">[\s\S]*?<\/Select>\s*<\/div>\s*<\/div>/;

const newFilterBar = `<div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search your notes..." 
                className="pl-9 h-11 rounded-xl bg-card border shadow-sm focus-visible:ring-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-card border shadow-sm font-medium focus:ring-indigo-500">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="summary">Summaries</SelectItem>
                  <SelectItem value="important questions">Important Questions</SelectItem>
                  <SelectItem value="cheat sheet">Cheat Sheets</SelectItem>
                  <SelectItem value="mind map">Mind Maps</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-card border shadow-sm font-medium focus:ring-indigo-500">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((sub: string) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-card border shadow-sm font-medium focus:ring-indigo-500">
                  <SelectValue placeholder="Sort: Latest" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="latest">Sort: Latest</SelectItem>
                  <SelectItem value="oldest">Sort: Oldest</SelectItem>
                  <SelectItem value="a-z">Sort: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1 border bg-card rounded-xl p-1 shadow-sm shrink-0">
               <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")} className={\`h-9 w-9 rounded-lg \${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}\`}><LayoutGrid className="h-4 w-4" /></Button>
               <Button variant="ghost" size="icon" onClick={() => setViewMode("list")} className={\`h-9 w-9 rounded-lg \${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}\`}><List className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
            {['All Notes', 'Summaries', 'Important Questions', 'Cheat Sheets', 'Mind Maps', 'Others'].map((cat) => {
               const isActive = activeCategory === cat;
               let count = 0;
               if (cat === 'All Notes') count = notes.length;
               else if (cat === 'Others') count = notes.filter(n => !['summary', 'important questions', 'cheat sheet', 'mind map'].includes(n.type?.toLowerCase())).length;
               else count = notes.filter(n => n.type?.toLowerCase().includes(cat.replace(/s$/, '').toLowerCase())).length;
               
               return (
                 <Badge 
                   key={cat}
                   variant={isActive ? "default" : "outline"} 
                   onClick={() => setActiveCategory(cat)}
                   className={\`rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors \${isActive ? 'bg-black text-white hover:bg-black/90' : 'bg-card hover:bg-slate-50 text-slate-600 border-border/60'}\`}
                 >
                   {cat} ({count})
                 </Badge>
               )
            })}
          </div>`;

file = file.replace(oldFilterBarRegex, newFilterBar);
fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched filter bar");
