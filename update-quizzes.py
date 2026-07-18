import sys

with open("src/components/Quizzes.tsx", "r") as f:
    content = f.read()

# 1. Import useLocation
content = content.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { useLocation } from "react-router-dom";'
)

# 2. Add useLocation hook inside Quizzes
content = content.replace(
    'export function Quizzes() {\n  const { triggerStreakCheck } = useStreak();',
    'export function Quizzes() {\n  const location = useLocation();\n  const { triggerStreakCheck } = useStreak();'
)

# 3. Modify useEffect to check for autoStartQuizId
use_effect_target = """  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchQuizzes(), fetchDocuments()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);"""

use_effect_replacement = """  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/quizzes');
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data.data);
          
          if (location.state?.autoStartQuizId) {
             const quizToStart = data.data.find((q: any) => q._id === location.state.autoStartQuizId);
             if (quizToStart) {
                setActiveQuiz(quizToStart);
                setCurrentQuestionIndex(0);
                setSelectedAnswers(new Array(quizToStart.questions.length).fill(-1));
                setQuizResult(null);
             }
          }
        }
        await fetchDocuments();
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadInitialData();
  }, [location.state]);"""

content = content.replace(use_effect_target, use_effect_replacement)

with open("src/components/Quizzes.tsx", "w") as f:
    f.write(content)
