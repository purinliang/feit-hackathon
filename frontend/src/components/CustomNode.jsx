// src/components/CustomNode.jsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data, isConnectable }) => {
    const isJob = data.type === 'job';

    // 节点的整体样式 (保持圆形)
    const nodeStyle = {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        // 职业和技能颜色区分
        border: isJob ? '3px solid #337ab7' : '2px solid #5cb85c',
        backgroundColor: isJob ? '#e6f7ff' : '#f9fff9',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    };

    // 内部文本样式
    const textStyle = {
        fontWeight: 'bold',
        fontSize: '0.8em',
        color: '#333',
        whiteSpace: 'pre-wrap',
        padding: '5px',
        lineHeight: '1.2'
    };

    // *** 关键修改：隐藏 Handle 的样式 ***
    const hiddenHandleStyle = {
        // 关键：将 Handle 的尺寸设置为 0，或者设置透明度，让它不可见
        width: '0px',
        height: '0px',
        opacity: 0,
        // 确保它仍然可以接收点击，但这里我们主要靠边自己连
    };

    return (
        <div style={nodeStyle}>
            {/* 1. Target Handle (入口) - 放在左侧 (Position.Left) */}
            <Handle
                type="target"
                position={Position.Left} // <--- 调整到左边
                isConnectable={isConnectable}
                style={hiddenHandleStyle} // <--- 使用隐藏样式
            />

            {/* 节点名称 (核心内容) */}
            <div style={textStyle}>
                {data.name}
            </div>

            {/* 2. Source Handle (出口) - 放在右侧 (Position.Right) */}
            <Handle
                type="source"
                position={Position.Right} // <--- 调整到右边
                isConnectable={isConnectable}
                style={hiddenHandleStyle} // <--- 使用隐藏样式
            />
        </div>
    );
};

export default CustomNode;