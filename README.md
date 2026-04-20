# 📘 🚀 SUPABASE SETUP & RUN GUIDE

A complete beginner-friendly programs demonstrating:

* 🔐 Supabase Authentication (Signup/Login)
* 🗄️ PostgreSQL Database (CRUD operations)
* 🔗 Table Relationships (Foreign Keys)
* 📊 Filtering, Sorting, Pagination
* ☁️ Supabase Storage Upload System
* 🔒 Row Level Security (RLS)
* 🌐 HTML + JavaScript Frontend Integration

---

# 📌 1. REQUIREMENTS

```bash
Google Chrome Browser
VS Code IDE
Supabase Account
```

---

# 🚀 2. SUPABASE SETUP

## 🔹 Create Project

Go to:

```
https://supabase.com
```

Create a new project.

---

## 🔹 Get Keys

Go to:

```
Settings → API
```

Copy:

```bash
SUPABASE_URL
SUPABASE_ANON_KEY
```

---

# 🔐 3. AUTHENTICATION

Enable:

```
Authentication → Settings → Email Auth
```

---

# ☁️ 4. STORAGE SETUP

Create bucket:

```
Storage → Create Bucket → images
```

---

## 🔹 RLS Policy (IMPORTANT)

```sql
create policy "Allow uploads"
on storage.objects
for insert
with check (true);
```

```sql
create policy "Allow read"
on storage.objects
for select
using (true);
```

---

# 💻 5. RUN PROJECTS

## 🔹 Open any HTML file

Use VS Code Live Server:

```bash
Right click → Open with Live Server

---

# 📊 6. FEATURES COVERED

## 🔹 Database

* Insert data
* Select data
* Filtering
* Sorting
* Pagination

## 🔹 Authentication

* Signup
* Login
* User session

## 🔹 Relationships

* Foreign key joins

## 🔹 Storage

* Image upload
* File management

## 🔹 Security

* Row Level Security (RLS)

---

# 🧠 LEARNING OUTCOME

After this project you will understand:

* How backend APIs work
* How databases connect to frontend
* How authentication systems work
* How real SaaS apps are built

---
