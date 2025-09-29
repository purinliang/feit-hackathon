// src/components/CustomNode.jsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data, isConnectable }) => {
    const isJob = data.type === 'job';

    // *** 节点的核心样式修改 ***
    const nodeStyle = {
        width: '60px',        // 宽度
        height: '60px',       // 高度
        borderRadius: '50%',  // 关键：实现圆形效果
        display: 'flex',      // 启用 flexbox 布局
        alignItems: 'center', // 垂直居中
        justifyContent: 'center', // 水平居中

        // 简化后的外观
        border: isJob ? '3px solid #337ab7' : '2px solid #5cb85c', // 职业和技能颜色区分
        backgroundColor: isJob ? '#e6f7ff' : '#f9fff9',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    };

    // 内部文本样式
    const textStyle = {
        fontWeight: 'bold',
        fontSize: '0.8em',
        color: '#333',
        // 隐藏其他细节，只保留名字
        whiteSpace: 'pre-wrap', // 允许名字换行
        padding: '5px',
        lineHeight: '1.2'
    };

    // *** 确保 Handle 的样式在圆形节点上正确显示 ***
    // Handle 的位置也需要是百分比来保持居中
    const handleStyle = {
        width: '10px',
        height: '10px',
        background: '#555',
    };

    return (
        <div style={nodeStyle}>
            {/* Target Handle (上方) */}
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ ...handleStyle, top: '-5px' }} // 微调位置
            />

            {/* 节点名称 (核心内容) */}
            <div style={textStyle}>
                {data.name}
            </div>

            {/* Source Handle (下方) */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{ ...handleStyle, bottom: '-5px' }} // 微调位置
            />
        </div>
    );
};

export default CustomNode;