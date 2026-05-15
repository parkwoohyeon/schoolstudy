# Database Design

## DB
Supabase PostgreSQL

---

## Table
sentiment_logs

| Column | Type |
|---|---|
| id | uuid |
| input_text | text |
| sentiment | varchar |
| confidence | integer |
| reason | text |
| created_at | timestamp |

---

## SQL

```sql
create table sentiment_logs (
  id uuid default gen_random_uuid() primary key,
  input_text text not null,
  sentiment varchar(20) not null,
  confidence integer not null,
  reason text not null,
  created_at timestamp default now()
);
```
