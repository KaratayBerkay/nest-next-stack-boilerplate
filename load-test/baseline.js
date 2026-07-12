import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const ok = [200, 201, 204];

  // Feed list
  {
    const r = http.get(`${BASE_URL}/api/posts?take=5`);
    check(r, { 'feed status ok': () => ok.includes(r.status) });
    errorRate.add(!ok.includes(r.status));
    sleep(1);
  }

  // Post detail (uses a known UUID; query /api/posts first to get a real one)
  {
    const feed = http.get(`${BASE_URL}/api/posts?take=1`).json();
    const id = feed.posts?.[0]?.id;
    if (id) {
      const r = http.get(`${BASE_URL}/api/posts/${id}`);
      check(r, { 'post detail status ok': () => ok.includes(r.status) });
      errorRate.add(!ok.includes(r.status));
    }
    sleep(1);
  }

  // Post search
  {
    const r = http.get(`${BASE_URL}/api/posts?take=5&search=test`);
    check(r, { 'search status ok': () => ok.includes(r.status) });
    errorRate.add(!ok.includes(r.status));
    sleep(1);
  }
}
