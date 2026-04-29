import http from 'k6/http';
import { check, fail, sleep } from 'k6';

const binFile = new Uint8Array([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08
]);

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGlldnNhaWQwOTA5IiwiaWF0IjoxNzY4OTAwOTUxLCJleHAiOjE3Njg5ODczNTF9.HNOWozYCauT-QD_qgh1PkVW13BTs2oTACjxySjzHiZQ';

if (!JWT_TOKEN.startsWith('ey')) {
    fail('FATAL: JWT_TOKEN is not set.');
}

export const options = {
    stages: [
        { duration: '10s', target: 20 },
        { duration: '10s', target: 20 },
        { duration: '5s', target: 0 },
    ],
    thresholds: {
        'http_req_failed': ['rate<0.01'],
        'http_req_duration': ['p(95)<1000'],
    },
};

export default function () {
    const params = {
        headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
        },
    };

    const payload = {
        title: `Stress Note ${__VU}-${__ITER}`,
        'files': http.file(binFile.buffer, `stress-${__VU}.jpg`, 'image/jpeg'),
    };

    const res = http.post('http://localhost:8080/api/v1/notes', payload, params);

    check(res, {
        'Status 201': (r) => r.status === 201,
        'Has ID': (r) => r.json('id') !== undefined,
    });

    sleep(0.1);
}
