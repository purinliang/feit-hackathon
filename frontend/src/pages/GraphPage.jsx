import React from 'react';
import { Box } from '@mui/material';
import Graph from '../components/Graph';

function GraphPage({
    width,
    height,
    learnedSkillIds,
    setLearnedSkillIds,
    recommendedJobId,
    setRecommendedJobId,
}) {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
            }}
        >
            <Graph
                {...{ width, height, learnedSkillIds, setLearnedSkillIds, recommendedJobId, setRecommendedJobId }}
            />
        </Box>
    );
}

export default GraphPage;