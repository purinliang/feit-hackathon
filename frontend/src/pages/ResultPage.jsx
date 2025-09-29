import React, { useMemo } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

function ResultPage({ learnedSkillIds, recommendedJobId, nodeMap, predecessorsMap }) {
    const recommendedJob = nodeMap.get(recommendedJobId)?.name || "None";

    const { skillsToLearn, totalTime } = useMemo(() => {
        if (!recommendedJobId) {
            return { skillsToLearn: [], totalTime: 0 };
        }
        const requiredSkills = predecessorsMap.get(recommendedJobId) || [];
        const skills = requiredSkills
            .filter(skillId => !learnedSkillIds.has(skillId))
            .map(skillId => {
                const node = nodeMap.get(skillId);
                return {
                    name: node?.name || skillId,
                    time: node?.time || 0,
                };
            });

        const total = skills.reduce((sum, skill) => sum + skill.time, 0);
        return { skillsToLearn: skills, totalTime: total };
    }, [recommendedJobId, learnedSkillIds, predecessorsMap, nodeMap]);

    return (
        <Box sx={{ p: 4, width: '100%', height: '100%', overflowY: 'auto', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom >
                Target Job
            </Typography>
            <Typography variant="body1" color={recommendedJobId ? "primary.light" : "text.secondary"} sx={{ mb: 4 }}>
                {recommendedJob}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Skills to Learn
            </Typography>

            {!recommendedJobId ? (
                <Typography variant="body2" color="text.secondary">Go back and select a recommended job to see the required skills.</Typography>
            ) : skillsToLearn.length > 0 ? (
                <List dense sx={{ maxWidth: 400, mx: 'auto' }}>
                    {skillsToLearn.map((skill) => (
                        <ListItem key={skill.name} disableGutters>
                            <ListItemText primary={skill.name} sx={{ textAlign: 'left' }} />
                            <Typography variant="body2" color="text.secondary">{skill.time} hours</Typography>
                        </ListItem>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <ListItem disableGutters sx={{ mt: 1 }}>
                        <Typography variant="h6" sx={{ textAlign: 'left', flexGrow: 1 }}>
                            Total Time
                        </Typography>
                        <Typography variant="h6">
                            {totalTime} hours
                        </Typography>
                    </ListItem>
                </List>
            ) : (
                <Typography variant="body2" color="text.secondary">Congratulations! You have learned all the recommended skills for this job.</Typography>
            )}
        </Box>
    );
}

export default ResultPage;