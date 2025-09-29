import React from 'react';
import { Box, Typography } from '@mui/material';

function ResultPage() {
    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Results Page
            </Typography>
            <Typography variant="body1">
                This is where your final results will be displayed.
            </Typography>
        </Box>
    );
}

export default ResultPage;