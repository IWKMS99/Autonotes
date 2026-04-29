import http from 'k6/http';
import { check, sleep, fail } from 'k6';

const binFile = new Uint8Array([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08
]);

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGlldnNhaWQwOTA5IiwiaWF0IjoxNzY4OTAwOTUxLCJleHAiOjE3Njg5ODczNTF9.HNOWozYCauT-QD_qgh1PkVW13BTs2oTACjxySjzHiZQ';

if (!JWT_TOKEN.startsWith('ey')) {
    fail('FATAL: JWT_TOKEN is not set.');
}

let createdNoteIds = [];

export const options = {
    scenarios: {
        upload_and_read: {
            executor: 'ramping-vus',
            exec: 'uploadAndRead',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 5 },
                { duration: '10s', target: 5 },
                { duration: '5s', target: 0 },
            ],
        },
        only_read: {
            executor: 'constant-vus',
            exec: 'onlyRead',
            vus: 5,
            duration: '35s',
        },
    },
    thresholds: {
        'http_req_duration{scenario:upload_and_read}': ['p(95)<2000'],
        'http_req_duration{scenario:only_read}': ['p(95)<500'],
        'http_req_failed': ['rate<0.05'],
    },
};

export function uploadAndRead() {
    const params = {
        headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
        }
    };

    const uploadData = {
        title: `Mixed Load Note ${__VU}-${__ITER}`,
        'files': http.file(binFile.buffer, `test-${__VU}.jpg`, 'image/jpeg'),
    };

    const uploadRes = http.post('http://localhost:8080/api/v1/notes', uploadData, params);

    if (uploadRes.status !== 201) {
        console.error(`Upload failed: ${uploadRes.status} ${uploadRes.body}`);
    }

    check(uploadRes, {
        'Upload 201': (r) => r.status === 201,
        'Has ID': (r) => r.json('id') !== undefined
    });

    if (uploadRes.status === 201) {
        try {
            const id = uploadRes.json('id');
            if (id) createdNoteIds.push(id);
        } catch (e) {}
    }

    sleep(1);

    if (Math.random() < 0.5 && createdNoteIds.length > 0) {
        const randIndex = Math.floor(Math.random() * createdNoteIds.length);
        const noteIdToRead = createdNoteIds[randIndex];

        const detailRes = http.get(`http://localhost:8080/api/v1/notes/${noteIdToRead}`, params);

        check(detailRes, {
            'Read 200 or 404': (r) => r.status === 200 || r.status === 404
        });
    }

    if (Math.random() < 0.2 && createdNoteIds.length > 3) {
        const noteIdToDelete = createdNoteIds.shift();

        const deleteRes = http.del(`http://localhost:8080/api/v1/notes/${noteIdToDelete}`, null, params);
        check(deleteRes, { 'Delete 204': (r) => r.status === 204 });
    }
}

export function onlyRead() {
    const params = { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` } };
    const listRes = http.get('http://localhost:8080/api/v1/notes', params);
    check(listRes, { 'List 200': (r) => r.status === 200 });
    sleep(2);
}
