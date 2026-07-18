import sys
import re

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

state_replacement = """
  const [loading, setLoading] = useState(true);
  const [dailyQuiz, setDailyQuiz] = useState<any>(null);
  const [loadingDailyQuiz, setLoadingDailyQuiz] = useState(true);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
"""
content = content.replace(
    "  const [loading, setLoading] = useState(true);\n  const [todayTasks, setTodayTasks] = useState<any[]>([]);",
    state_replacement.strip('\n')
)

fetch_replacement = """
  useEffect(() => {
    const fetchDailyQuiz = async () => {
      setLoadingDailyQuiz(true);
      try {
        const res = await apiFetch('/api/quizzes/daily');
        if (res.ok) {
          const json = await res.json();
          setDailyQuiz(json.data);
        }
      } catch (err) {
        console.error("Error fetching daily quiz", err);
      } finally {
        setLoadingDailyQuiz(false);
      }
    };
    fetchDailyQuiz();
  }, []);

  useEffect(() => {
"""

content = content.replace("  useEffect(() => {\n    const fetchData = async () => {", fetch_replacement.lstrip('\n') + "    const fetchData = async () => {")

with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
