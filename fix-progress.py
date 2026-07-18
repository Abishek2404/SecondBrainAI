import sys

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

target = """              {/* Mini Line Chart Placeholder */}
              <div className="hidden lg:flex w-[200px] h-[70px] shrink-0 opacity-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={[
                      { v: 40 }, { v: 30 }, { v: 45 }, { v: 50 }, { v: 40 }, { v: 65 }, { v: 80 }
                    ]}>
                       <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                    </RechartsLineChart>
                 </ResponsiveContainer>
              </div>"""

replacement = """              {/* Mini Line Chart Placeholder */}
              <div className="hidden lg:flex w-[200px] h-[70px] shrink-0 opacity-80">
                 {analytics?.studyDistribution && analytics.studyDistribution.length > 0 && (
                 <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analytics.studyDistribution}>
                       <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                    </RechartsLineChart>
                 </ResponsiveContainer>
                 )}
              </div>"""

content = content.replace(target, replacement)
with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
