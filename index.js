import React, { useState, useEffect } from 'react';

// --- 1. 你的专属题库中心 ---
// 在这里，你可以为不同的ID，配置不同的姓名和专属试卷
const allQuizzes = {
  'zhangsan-g7-eng': {
    studentName: '张三',
    quizPages: [
      {
        title: '第一关：问候与介绍',
        type: 'multiple_choice',
        questions: [
            { question: '— Hello, I\'m Tom. — ______', options: ['Thank you', 'Hello, I\'m Jerry', 'It\'s a cat', 'Good morning'], answer: 'Hello, I\'m Jerry', points: 5 },
            { question: '— What\'s your name? — My name ___ Gina.', options: ['am', 'are', 'is', 'be'], answer: 'is', points: 5 },
            { question: '— Good morning, Miss Gao. — ______', options: ['Hello, Li Ming', 'Good morning, class', 'I\'m fine', 'See you'], answer: 'Good morning, class', points: 5 },
            { question: '— How are you? — ______', options: ['I am a boy', 'I\'m fine, thanks', 'My name is Li Lei', 'I am 12'], answer: 'I\'m fine, thanks', points: 5 },
            { question: '当你想知道某人的名字时，你应该问：', options: ['How old are you?', 'What\'s this in English?', 'What\'s your name?', 'How are you?'], answer: 'What\'s your name?', points: 5 }
        ]
      },
      // ... 你可以继续为张三添加更多关卡
    ]
  },
  'lisi-g10-math': {
    studentName: '李四',
    quizPages: [
      {
        title: '第一关：集合的概念',
        type: 'multiple_choice',
        questions: [
            { question: '下列选项中，能表示集合的是？', options: ['所有高个子的人', '好吃的食物', '所有正整数', '善良的人'], answer: '所有正整数', points: 10 },
            { question: '集合 {1, 2, 3} 的子集有多少个？', options: ['3', '6', '7', '8'], answer: '8', points: 10 },
        ]
      },
      {
        title: '第二关：基础运算',
        type: 'true_false',
        questions: [
            { question: '空集是任何集合的子集。', answer: true, points: 10 },
            { question: '表达式 a*b = b*a 体现了乘法的交换律。', answer: true, points: 10 },
        ]
      }
    ]
  }
  // 你可以继续添加更多ID和对应的题库
};

const matchColors = [
    { bg: '#dcfce7', border: '#22c55e' }, { bg: '#fef3c7', border: '#f59e0b' },
    { bg: '#dbeafe', border: '#3b82f6' }, { bg: '#fce7f3', border: '#ec4899' },
    { bg: '#f3e8ff', border: '#a855f7' },
];


// --- 2. 核心应用组件 ---
export default function App() {
  const [studentId, setStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (!id) {
        throw new Error("网址中缺少身份ID (例如: ?id=zhangsan-g7-eng)");
      }
      const data = allQuizzes[id];
      if (!data) {
        throw new Error(`找不到ID为 "${id}" 的专属任务，请检查链接是否正确。`);
      }
      setStudentId(id);
      setStudentData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return <Quiz studentId={studentId} studentData={studentData} />;
}


// --- 3. 问答游戏组件 ---
function Quiz({ studentId, studentData }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  
  const { studentName, quizPages } = studentData;

  // 检查今天是否已打卡
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = localStorage.getItem(`lastCheckin_${studentId}`);
    if (lastCheckin === today) {
        const savedResult = JSON.parse(localStorage.getItem(`result_${studentId}`));
        setFinalResult(savedResult);
        setIsSubmitted(true);
    }
  }, [studentId]);

  const handleAnswerChange = (globalIndex, value) => {
    setUserAnswers(prev => ({ ...prev, [globalIndex]: value }));
  };

  const calculateScore = () => {
    // ... (计分逻辑与之前版本相同) ...
    let score = 0;
    let globalIndex = 0;
    quizPages.forEach(page => {
        page.questions.forEach(q => {
            const userAnswer = userAnswers[globalIndex];
            if (userAnswer !== undefined) {
                if (page.type === 'multiple_choice') { if (userAnswer === q.answer) score += q.points; } 
                else if (page.type === 'true_false') { if (userAnswer === String(q.answer)) score += q.points; }
            }
            globalIndex++;
        });
    });
    return Math.round(score);
  };

  const handleSubmit = () => {
    const currentQuizScore = calculateScore();
    const existingTotalScore = parseInt(localStorage.getItem(`totalScore_${studentId}`) || '0', 10);
    const newTotalScore = existingTotalScore + currentQuizScore;

    const result = {
        currentQuizScore,
        totalScore: newTotalScore,
    };
    
    // 保存到“本地大脑”
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`lastCheckin_${studentId}`, today);
    localStorage.setItem(`totalScore_${studentId}`, newTotalScore);
    localStorage.setItem(`result_${studentId}`, JSON.stringify(result));
    
    setFinalResult(result);
    setIsSubmitted(true);
  };

  if (isSubmitted && finalResult) {
    return <ResultScreen studentName={studentName} result={finalResult} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-3xl bg-white/80">
      <Header 
        studentName={studentName} 
        pageTitle={quizPages[currentPageIndex].title}
        currentPage={currentPageIndex + 1}
        totalPages={quizPages.length}
      />
      <main className="space-y-4">
        <QuizPage 
          pageData={quizPages[currentPageIndex]}
          currentPageIndex={currentPageIndex}
          userAnswers={userAnswers}
          handleAnswerChange={handleAnswerChange}
        />
      </main>
      <Navigation 
        currentPageIndex={currentPageIndex}
        totalPages={quizPages.length}
        goToPrevPage={() => setCurrentPageIndex(p => p - 1)}
        goToNextPage={() => setCurrentPageIndex(p => p + 1)}
        submitQuiz={handleSubmit}
      />
    </div>
  );
}

// --- 4. 辅助组件 ---
function Header({ studentName, pageTitle, currentPage, totalPages }) {
    return (
        <header className="bg-white/90 p-4 rounded-2xl shadow-md mb-4 sticky top-4 z-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{pageTitle}</h1>
                    <p className="text-md text-gray-500">欢迎你, {studentName}!</p>
                </div>
                <div className="text-gray-600 font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    第 {currentPage} / {totalPages} 关
                </div>
            </div>
        </header>
    );
}

function QuizPage({ pageData, currentPageIndex, userAnswers, handleAnswerChange }) {
    // ... (渲染单个页面的逻辑，与之前版本类似) ...
    return pageData.questions.map((q, index) => {
        const globalIndex = quizPages.slice(0, currentPageIndex).reduce((acc, p) => acc + p.questions.length, 0) + index;
        return (
            <div key={globalIndex} className="question-card p-4 rounded-2xl shadow-md">
                <p className="text-lg font-semibold mb-3">{index + 1}. {q.question} ({q.points}分)</p>
                {/* 渲染不同题型的逻辑 */}
            </div>
        );
    });
}

function Navigation({ currentPageIndex, totalPages, goToPrevPage, goToNextPage, submitQuiz }) {
    return (
        <div className="mt-6 flex justify-between items-center">
            <button onClick={goToPrevPage} className={`px-6 py-2 bg-white text-gray-700 rounded-full shadow ${currentPageIndex === 0 ? 'invisible' : ''}`}>
                上一页
            </button>
            {currentPageIndex < totalPages - 1 && (
                <button onClick={goToNextPage} className="px-6 py-2 btn-main rounded-full shadow-lg">
                    下一页
                </button>
            )}
            {currentPageIndex === totalPages - 1 && (
                <button onClick={submitQuiz} className="w-full sm:w-2/3 btn-main font-bold py-4 rounded-full text-xl">
                    完成挑战，提交答案！
                </button>
            )}
        </div>
    );
}

function ResultScreen({ studentName, result }) {
    return (
        <div className="text-center bg-white/90 p-6 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-2 text-purple-600">✅ 挑战完成! ✅</h2>
            <p className="text-lg text-gray-700 mb-4">做得好, {studentName}!</p>
            <div className="space-y-2 text-xl bg-purple-50 p-4 rounded-lg">
                <p>本次得分: <strong className="text-purple-700">{result.currentQuizScore}</strong> 分</p>
                <p>累计总分: <strong className="text-green-600">{result.totalScore}</strong> 分</p>
            </div>
            <p className="mt-4 text-sm text-red-500 font-semibold">你今天已经打过卡啦，明天再来挑战新的任务吧！</p>
        </div>
    );
}

