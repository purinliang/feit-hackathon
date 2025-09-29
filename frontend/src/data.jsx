// src/data.js

const initialGraphData = {
    nodes: [
        // --- 1. 起点/现有技能 ---
        { id: 'you', name: '我 (已具备)', type: 'job', time: 0, value: 0 },
        { id: 'english', name: '商务英语', type: 'skill', time: 80, value: 65 },
        { id: 'excel', name: '高级Excel', type: 'skill', time: 40, value: 50 },

        // --- 2. 核心技术技能 (前端/后端) ---
        { id: 'html', name: 'HTML/CSS', type: 'skill', time: 50, value: 70 },
        { id: 'js', name: 'JavaScript', type: 'skill', time: 100, value: 85 },
        { id: 'react', name: 'React', type: 'skill', time: 150, value: 90 },
        { id: 'python', name: 'Python', type: 'skill', time: 120, value: 80 },
        { id: 'sql', name: 'SQL/数据库', type: 'skill', time: 60, value: 78 },

        // --- 3. 进阶技能 / 框架 ---
        { id: 'ts', name: 'TypeScript', type: 'skill', time: 60, value: 88 },
        { id: 'docker', name: 'Docker/K8S', type: 'skill', time: 90, value: 90 },
        { id: 'finance', name: '金融知识', type: 'skill', time: 120, value: 75 },

        // --- 4. 目标职业 (需要固定在最右侧) ---
        { id: 'fe_dev', name: '高级前端工程师', type: 'job', time: 0, value: 95 },
        { id: 'be_dev', name: '全栈工程师', type: 'job', time: 0, value: 92 },
        { id: 'data_sci', name: '金融数据分析师', type: 'job', time: 0, value: 88 },
    ],
    edges: [
        // --- A. 用户起点依赖 (假设用户现有技能是其他技能的依赖) ---
        { id: 'e-you-english', source: 'you', target: 'english', necessity: 0.90 },
        { id: 'e-you-excel', source: 'you', target: 'excel', necessity: 0.80 },

        // --- B. 基础技术路径 (多层级依赖) ---
        { id: 'e-excel-sql', source: 'excel', target: 'sql', necessity: 0.60 },
        { id: 'e-html-js', source: 'html', target: 'js', necessity: 0.80 },
        { id: 'e-js-react', source: 'js', target: 'react', necessity: 0.95 },
        { id: 'e-react-ts', source: 'react', target: 'ts', necessity: 0.70 }, // React -> TypeScript

        // --- C. 交叉和后端路径 ---
        { id: 'e-js-python', source: 'js', target: 'python', necessity: 0.30 }, // JS 程序员学 Python
        { id: 'e-python-docker', source: 'python', target: 'docker', necessity: 0.65 },
        { id: 'e-ts-docker', source: 'ts', target: 'docker', necessity: 0.40 }, // TS 程序员也需要 Docker

        // --- D. 目标职业依赖 (连接到右侧 Job) ---
        // 目标 1: 前端
        { id: 'e-ts-fe', source: 'ts', target: 'fe_dev', necessity: 0.90 },
        { id: 'e-docker-fe', source: 'docker', target: 'fe_dev', necessity: 0.50 },

        // 目标 2: 全栈 (同时需要前端和后端进阶)
        { id: 'e-docker-be', source: 'docker', target: 'be_dev', necessity: 0.80 },
        { id: 'e-ts-be', source: 'ts', target: 'be_dev', necessity: 0.75 },

        // 目标 3: 金融数据分析师 (需要交叉技能)
        { id: 'e-python-data', source: 'python', target: 'data_sci', necessity: 0.85 },
        { id: 'e-sql-data', source: 'sql', target: 'data_sci', necessity: 0.70 },
        { id: 'e-finance-data', source: 'finance', target: 'data_sci', necessity: 0.95 }, // 强依赖金融知识
        { id: 'e-english-data', source: 'english', target: 'data_sci', necessity: 0.40 },
    ],
};

export default initialGraphData;