import React from 'react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false });

const QrScannerWithConstraints = ({ onScan, onError, videoConstraints }) => {
    return (
        <QrScanner
            delay={300}
            style={{ height: 320, width: 320 }} //ig we can check this with the max-w-[320px] in the app but its fine for now
            onError={onError}
            onScan={onScan}
            videoConstraints={videoConstraints}
        />
    );
};

export default QrScannerWithConstraints;
