## Log Query Hooks

When asked to read/show websocket logs, payment logs, billing logs, or any application logs, query the last logs from Elasticsearch.

- **ES endpoint:** `http://10.10.2.51:9200`
- **Kibana:** `http://10.10.2.51:5601`

### Quick queries

| Log type | ES index | Query |
|---|---|---|
| WebSocket exceptions | `websocket-exception-logs` | `curl -s http://10.10.2.51:9200/websocket-exception-logs/_search?size=20` |
| HTTP exceptions | `http-exception-logs` | `curl -s http://10.10.2.51:9200/http-exception-logs/_search?size=20` |
| App exceptions | `application-exception-logs` | `curl -s http://10.10.2.51:9200/application-exception-logs/_search?size=20` |
| Session logs | `session-logs` | `curl -s http://10.10.2.51:9200/session-logs/_search?size=20` |
| Page logs | `page-logs` | `curl -s http://10.10.2.51:9200/page-logs/_search?size=20` |
| Network logs | `network-logs` | `curl -s http://10.10.2.51:9200/network-logs/_search?size=20` |
| Database logs | `database-logs` | `curl -s http://10.10.2.51:9200/database-logs/_search?size=20` |
| Performance logs | `performance-logs` | `curl -s http://10.10.2.51:9200/performance-logs/_search?size=20` |
| App logs (all backend) | `app-logs` | `curl -s http://10.10.2.51:9200/app-logs/_search?size=20` |
| Payment logs | `payment-logs` | `curl -s http://10.10.2.51:9200/payment-logs/_search?size=20` |
| Billing logs | `billing-logs` | `curl -s http://10.10.2.51:9200/billing-logs/_search?size=20` |
| Frontend logs (all) | `frontend-logs` | `curl -s http://10.10.2.51:9200/frontend-logs/_search?size=20` |

Always return the results formatted with `python3 -m json.tool` and summarize key fields like `event`, `context`, `service`, `level`, `userId`, `errorMessage`, `category`.
