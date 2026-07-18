import sys

with open("src/components/Quizzes.tsx", "r") as f:
    content = f.read()

target = """          if (location.state?.autoStartQuizId) {
             const quizToStart = data.data.find((q: any) => q._id === location.state.autoStartQuizId);
             if (quizToStart) {
                setActiveQuiz(quizToStart);
                setCurrentQuestionIndex(0);
                setSelectedAnswers(new Array(quizToStart.questions.length).fill(-1));
                setQuizResult(null);
             }
          }"""

replacement = """          if (location.state?.autoStartQuizId) {
             const quizToStart = data.data.find((q: any) => q._id === location.state.autoStartQuizId);
             if (quizToStart) {
                const fullRes = await apiFetch(`/api/quizzes/${quizToStart._id}`);
                if (fullRes.ok) {
                   const fullData = await fullRes.json();
                   setActiveQuiz(fullData.data);
                   setCurrentQuestionIndex(0);
                   if (fullData.data.questions) {
                       setSelectedAnswers(new Array(fullData.data.questions.length).fill(-1));
                   }
                   setQuizResult(null);
                }
             }
          }"""

content = content.replace(target, replacement)
with open("src/components/Quizzes.tsx", "w") as f:
    f.write(content)
