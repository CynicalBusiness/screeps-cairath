export const STATS_SIZE = 0.5;
export const STATS_FORMAT = `{time}
{shardName} (type:{shardType},ptr:{shardPTR})
ticks {tick} ({deltaTick}) {tickrate}ms
cpu {cpuUsed}/{cpuLimit}/{cpuTickLimit} ({cpuBucket})
`;

export const INIT_MESSAGE =
    "<span style='font-weight:bold;font-size:120%'>GameCore {name}@{version}</span> {isoDate} (delta {deltaTicks}t)";
