import React from 'react';
import { ResponsiveStream } from '@nivo/stream'

import stream_data from './data';

import './CurrentPower.css';

const all_keys_lists = stream_data.map(data => Object.keys(data))
const all_keys = all_keys_lists.reduce((accumulator, value) => accumulator.concat(value), []);
const unique_keys = new Set(all_keys)
stream_data.map(
    data => unique_keys.forEach(function (key) {
        if (Object.keys(data).indexOf(key) === -1) {
            data[key] = 0
        }
    })
)

export default function CurrentPower() {

    return (
        <div className="chart">
            <ResponsiveStream
                data={stream_data}
                keys={Array.from(unique_keys)}
                margin={{ top: 15, right: 15, bottom: 50, left: 40 }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: '',
                    legendOffset: 36
                }}
                axisLeft={{ 
                    orient: 'left', 
                    tickSize: 5, 
                    tickPadding: 5, 
                    tickRotation: 0, 
                    legend: '', 
                    legendOffset: -40 
                }}
                enableGridX={false}
                enableGridY
                offsetType="none"
                order="descending"
                colors={{ scheme: 'nivo' }}
                fillOpacity={0.85}
                borderColor={{ theme: 'background' }}
                legends={[]}
            />
        </div>
    );
}
