import React from 'react';
import { Box } from '@mui/material';
import Graph from '../components/Graph';

function GraphPage({ graphWidth, graphHeight }) {
    return (
        <Box
            sx={{
                width: graphWidth,
                height: graphHeight,
                border: "1px solid #ccc", // 可选：为了可视化 Graph 区域的边界
                flexShrink: 0,
            }}
        >
            <Graph width={graphWidth} height={graphHeight} />
        </Box>
    );
}

export default GraphPage;