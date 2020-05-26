import React from 'react';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper }
    from '@material-ui/core';

export default function StationInfo(props) {
    const commasInNumber = (number) => 
        number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

    return(
        <TableContainer component={Paper}>
            <Table aria-label="summary-table">
                <TableHead>
                    <TableRow>
                        <TableCell>Altitude (ft)</TableCell>
                        <TableCell>Snow Depth (in)</TableCell>
                        <TableCell>Identifier</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{commasInNumber(props.selectedStation.elevation)}</TableCell>
                        <TableCell>{props.selectedStation.snowDepth}</TableCell>
                        <TableCell>{props.selectedStation.triplet}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}
