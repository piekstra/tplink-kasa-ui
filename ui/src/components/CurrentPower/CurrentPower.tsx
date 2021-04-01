import React from 'react';
import { ResponsiveStream } from '@nivo/stream'

import stream_data from './data';

import './CurrentPower.css';

export default function CurrentPower() {

    return (
        <div className="chart">
            <ResponsiveStream
                data={stream_data}
                keys={[ 'Raoul', 'Josiane', 'Marcel', 'René', 'Paul', 'Jacques' ]}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
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
                axisLeft={{ orient: 'left', tickSize: 5, tickPadding: 5, tickRotation: 0, legend: '', legendOffset: -40 }}
                offsetType="none"
                order="descending"
                colors={{ scheme: 'nivo' }}
                fillOpacity={0.85}
                borderColor={{ theme: 'background' }}
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'column',
                        translateX: 100,
                        itemWidth: 80,
                        itemHeight: 20,
                        itemTextColor: '#999999',
                        symbolSize: 12,
                        symbolShape: 'circle',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#000000'
                                }
                            }
                        ]
                    }
                ]}
            />
        </div>
    );
}
