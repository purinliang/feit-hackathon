import React, { useMemo } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';

function ResultPage({ learnedSkillIds, recommendedJobId, nodeMap, predecessorsMap, jobSkillNecessity }) {
    const recommendedJob = nodeMap.get(recommendedJobId)?.name || "None";

    const { allRequiredSkills, totalTime, prioritySkillIds } = useMemo(() => {
        if (!recommendedJobId) {
            return { allRequiredSkills: [], totalTime: 0, prioritySkillIds: new Set() };
        }

        // 1. 获取目标岗位需要的所有技能
        const requiredSkillIds = predecessorsMap.get(recommendedJobId) || [];
        const allSkills = requiredSkillIds
            .map(skillId => {
                const node = nodeMap.get(skillId);
                return {
                    id: skillId,
                    name: node?.name || skillId,
                    time: node?.time || 0,
                };
            });

        // 2. 从所有技能中筛选出未学习的
        const unlearnedSkills = allSkills.filter(skill => !learnedSkillIds.has(skill.id));

        // 3. 计算总时间（仅累加未学习的技能）
        const total = unlearnedSkills
            .reduce((sum, skill) => sum + skill.time, 0);

        // 4. 找出优先推荐的技能（逻辑与 Graph.jsx 保持一致）
        const jobNecessityMap = jobSkillNecessity.get(recommendedJobId) || new Map();

        // 复制数组进行排序，避免修改原数组
        const sortedUnlearnedSkills = [...unlearnedSkills].sort((a, b) => {
            const necessityA = jobNecessityMap.get(a.id) || 0;
            const necessityB = jobNecessityMap.get(b.id) || 0;
            return necessityB - necessityA;
        });

        const priorityIds = new Set(sortedUnlearnedSkills.slice(0, 3).map(skill => skill.id));

        return { allRequiredSkills: allSkills, totalTime: total, prioritySkillIds: priorityIds };

    }, [recommendedJobId, learnedSkillIds, predecessorsMap, nodeMap, jobSkillNecessity]);

    return (
        <Box sx={{ p: 4, width: '100%', height: '100%', overflowY: 'auto', textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom >
                Target Job:  {recommendedJob}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Required Skills
            </Typography>

            {!recommendedJobId ? (
                <Typography variant="body2" color="text.secondary">Go back and select a recommended job to see the required skills.</Typography>
            ) : allRequiredSkills.length > 0 ? (
                <List dense sx={{ maxWidth: 400, mx: 'auto' }}>
                    {[...allRequiredSkills]
                        .sort((a, b) => {
                            const aIsPriority = prioritySkillIds.has(a.id);
                            const bIsPriority = prioritySkillIds.has(b.id);
                            const aIsLearned = learnedSkillIds.has(a.id);
                            const bIsLearned = learnedSkillIds.has(b.id);

                            if (aIsLearned !== bIsLearned) {
                                return aIsLearned ? 1 : -1; // 已学习的排在后面
                            }
                            if (aIsPriority !== bIsPriority) {
                                return aIsPriority ? -1 : 1; // 优先推荐的排在前面
                            }
                            return 0; // 保持原有顺序
                        })
                        .map((skill) => {
                            const isLearned = learnedSkillIds.has(skill.id);
                            const isPriority = prioritySkillIds.has(skill.id);
                            return (
                                <ListItem key={skill.id} disableGutters>
                                    <ListItemText
                                        primary={skill.name}
                                        sx={{
                                            textAlign: 'left',
                                            textDecoration: isLearned ? 'line-through' : 'none',
                                            color: isLearned ? 'text.disabled' : (isPriority ? '#fbbf24' : 'text.primary'),
                                            fontWeight: isPriority ? 'bold' : 'normal',
                                        }}
                                    />
                                    {isPriority && <Chip label="Priority" size="small" sx={{ mr: 2, bgcolor: '#fbbf24', color: 'black' }} />}
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: '80px', textAlign: 'right' }}>{skill.time} hours</Typography>
                                </ListItem>
                            );
                        })}
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