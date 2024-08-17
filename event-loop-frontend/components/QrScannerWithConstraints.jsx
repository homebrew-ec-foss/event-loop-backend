
import React from 'react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false });

const QrScannerWithConstraints = ({ onScan, onError, style }) => {

    const videoConstraints = {
        facingMode: { exact: "environment" }, // "environment" generally means rear camera i think
        width: 1280,
        height: 720
    };

    return (
        <QrScanner
            delay={300}
            style={style}
            onError={onError}
            onScan={onScan}
            videoConstraints={videoConstraints}
        />
    );
};

export default QrScannerWithConstraints;
