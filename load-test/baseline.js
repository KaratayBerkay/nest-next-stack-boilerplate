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
const GRAPHQL = '/graphql';

const FEED_QUERY = `query Feed($cursor: ID, $take: Int) {
  postList(cursor: $cursor, take: $take) {
    id title content imageUrl createdAt status
    author { id name email }
    reactions { id type userId user { name } }
    _count { comments reactions }
  }
}`;

const POST_QUERY = `query Post($id: ID!) {
  post(id: $id) {
    id title content imageUrl createdAt status
    author { id name email }
    comments {
      id body createdAt authorId
      author { id name email }
    }
    reactions { id type userId user { name } }
    _count { comments reactions }
  }
}`;

export default function () {
  // Feed list (GraphQL)
  {
    const r = http.post(`${BASE_URL}${GRAPHQL}`, JSON.stringify({
      query: FEED_QUERY,
      variables: { take: 5 },
    }), { headers: { 'Content-Type': 'application/json' } });
    check(r, { 'feed status ok': () => r.status === 200 });
    errorRate.add(r.status !== 200);
    sleep(1);
  }

  // Post detail (uses first post ID from feed)
  {
    const feedRes = http.post(`${BASE_URL}${GRAPHQL}`, JSON.stringify({
      query: FEED_QUERY,
      variables: { take: 1 },
    }), { headers: { 'Content-Type': 'application/json' } });
    const body = feedRes.json();
    const id = body?.data?.postList?.[0]?.id;
    if (id) {
      const r = http.post(`${BASE_URL}${GRAPHQL}`, JSON.stringify({
        query: POST_QUERY,
        variables: { id },
      }), { headers: { 'Content-Type': 'application/json' } });
      check(r, { 'post detail status ok': () => r.status === 200 });
      errorRate.add(r.status !== 200);
    }
    sleep(1);
  }

  // Post search (via GraphQL)
  {
    const r = http.post(`${BASE_URL}${GRAPHQL}`, JSON.stringify({
      query: FEED_QUERY,
      variables: { take: 5, search: 'test' },
    }), { headers: { 'Content-Type': 'application/json' } });
    check(r, { 'search status ok': () => r.status === 200 });
    errorRate.add(r.status !== 200);
    sleep(1);
  }
}
