import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

function ResultPage({ learnedSkillIds, recommendedJobId, nodeMap }) {
    const learnedSkills = Array.from(learnedSkillIds).map(id => nodeMap.get(id)?.name || id);
    const recommendedJob = nodeMap.get(recommendedJobId)?.name || "None";

    return (
        <Box sx={{ p: 4, width: '100%', height: '100%', overflowY: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Results Page
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Recommended Job
            </Typography>
            <Typography variant="body1" color={recommendedJobId ? "primary.light" : "text.secondary"} sx={{ mb: 4 }}>
                {recommendedJob}
            </Typography>

            <Divider />

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Learned Skills ({learnedSkills.length})
            </Typography>
            {learnedSkills.length > 0 ? (
                <List dense>
                    {learnedSkills.map((skill, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={skill} />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    You haven't selected any learned skills.
                </Typography>
            )}
        </Box>
    );
}

export default ResultPage;