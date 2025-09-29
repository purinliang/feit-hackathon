const initialGraphData = {
    nodes: [
        { id: 'js', name: 'JavaScript', type: 'skill', time: 100, value: 85 },
        { id: 'react', name: 'React', type: 'skill', time: 150, value: 90 },
        { id: 'fe_dev', name: '前端开发', type: 'job', time: 0, value: 95 },
        { id: 'html', name: 'HTML/CSS', type: 'skill', time: 50, value: 70 },
    ],
    edges: [
        { id: 'e-html-js', source: 'html', target: 'js', necessity: 0.80 },
        { id: 'e-js-react', source: 'js', target: 'react', necessity: 0.95 },
        { id: 'e-react-fe', source: 'react', target: 'fe_dev', necessity: 0.85 },
        { id: 'e-js-fe', source: 'js', target: 'fe_dev', necessity: 0.40 },
    ],
};

// 确保数据被导出，以便 dataTransformer.js 能够导入
export default initialGraphData;