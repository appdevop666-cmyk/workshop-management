# 📊 Diagram Aplikasi Workshop Management

## 1. Alur Login & Single Session

```mermaid
flowchart TD
    A([👤 User buka halaman Login]) --> B[Masukkan Email & Password]
    B --> C[Tekan tombol Login]
    C --> D{Cek RPC:\nAda sesi aktif?}
    D -- Tidak ada --> E[Proses login ke Supabase Auth]
    D -- Ada sesi aktif --> F[⚠️ Muncul Dialog:\nSesi Sedang Aktif]
    F --> G([❌ Klik Mengerti → Batal login])
    E --> H{Login berhasil?}
    H -- Gagal --> I([🔴 Tampilkan pesan error])
    H -- Berhasil --> J[Buat token sesi baru UUID]
    J --> K[Simpan token ke:\nDB profiles + localStorage]
    K --> L{Cek role user}
    L -- verifikator --> M([🏠 Dashboard Manager])
    L -- mechanic --> N([🔧 Halaman Pilih Mode])

    style F fill:#fef3c7,stroke:#f59e0b
    style G fill:#fee2e2,stroke:#ef4444
    style I fill:#fee2e2,stroke:#ef4444
    style M fill:#d1fae5,stroke:#10b981
    style N fill:#d1fae5,stroke:#10b981
```

---

## 2. Alur Kerja Tiket Kendaraan

```mermaid
flowchart LR
    subgraph MEKANIK["🔧 Mekanik"]
        A[Terima kendaraan] --> B[Isi Checklist\nsparepart & pekerjaan]
        B --> C[Kirim ke Manager]
    end

    subgraph MANAGER["👔 Manager / Verifikator"]
        D[Terima notifikasi\ntiket baru 🔔] --> E[Buka & periksa\ndetail tiket]
        E --> F[Setujui harga\ntiket → status: priced]
    end

    subgraph MEKANIK2["🔧 Mekanik - Pengerjaan"]
        G[Terima notifikasi\npersetujuan ✅] --> H[Mulai pengerjaan\nstatus: in_progress]
        H --> I[Pengerjaan selesai\nstatus: completed]
    end

    subgraph MANAGER2["👔 Manager - Invoice"]
        J[Buka laporan] --> K[Cetak / lihat\nInvoice PDF]
    end

    C -->|Realtime| D
    F -->|Realtime| G
    I --> J

    style MEKANIK fill:#eff6ff,stroke:#3b82f6
    style MANAGER fill:#f0fdf4,stroke:#22c55e
    style MEKANIK2 fill:#eff6ff,stroke:#3b82f6
    style MANAGER2 fill:#f0fdf4,stroke:#22c55e
```

---

## 3. Status Tiket

```mermaid
stateDiagram-v2
    [*] --> pending : Mekanik kirim checklist
    pending --> priced : Manager setujui harga
    priced --> in_progress : Mekanik mulai kerjakan
    in_progress --> completed : Mekanik selesai
    completed --> [*] : Invoice dicetak

    note right of pending
        🔔 Notifikasi ke Manager
    end note
    note right of priced
        ✅ Notifikasi ke Mekanik
    end note
```

---

## 4. Struktur Database

```mermaid
erDiagram
    auth_users {
        uuid id PK
        string email
    }

    profiles {
        uuid id PK,FK
        string full_name
        string role
        string current_session_token
    }

    tickets {
        uuid id PK
        string license_plate
        string client_name
        string car_brand
        string status
        uuid mechanic_id FK
        timestamp created_at
    }

    ticket_items {
        uuid id PK
        uuid ticket_id FK
        int sparepart_id FK
        int quantity
        decimal estimated_price
    }

    categories {
        int id PK
        string name
    }

    spareparts {
        int id PK
        int category_id FK
        string name
    }

    company_settings {
        int id PK
        string company_name
        string company_address
        string payment_method
    }

    auth_users ||--|| profiles : "1 to 1"
    profiles ||--o{ tickets : "mengerjakan"
    tickets ||--o{ ticket_items : "berisi"
    spareparts ||--o{ ticket_items : "digunakan di"
    categories ||--o{ spareparts : "memiliki"
```

---

## 5. Arsitektur Halaman Aplikasi

```mermaid
graph TD
    Login([🔐 Login]) --> SelectMode

    SelectMode{Pilih Mode} --> MechanicDash
    SelectMode --> ChecklistMode

    Login --> Dashboard

    subgraph MANAGER_PAGES["Panel Manager (VerifikatorLayout)"]
        Dashboard[📊 Dashboard]
        Queue[📋 Antrean Kendaraan]
        MasterData[🗃️ Master Data]
        Report[📄 Laporan & Invoice]
        Settings[⚙️ Pengaturan]
        VerifyTicket[✅ Verifikasi Tiket]
        InvoiceDetail[🧾 Detail Invoice]
    end

    subgraph MECHANIC_PAGES["Panel Mekanik"]
        MechanicDash[🔧 Dashboard Mekanik]
        ChecklistMode[📝 Mode Checklist]
        TicketDetail[📋 Detail Tiket]
    end

    Dashboard --> Queue
    Dashboard --> VerifyTicket
    Queue --> VerifyTicket
    Report --> InvoiceDetail
    MechanicDash --> TicketDetail

    style MANAGER_PAGES fill:#f0fdf4,stroke:#22c55e
    style MECHANIC_PAGES fill:#eff6ff,stroke:#3b82f6
```

---

## 6. Keamanan Sesi Real-time

```mermaid
sequenceDiagram
    participant A as Browser A (Aktif)
    participant DB as Database Supabase
    participant B as Browser B (Baru)

    Note over A,DB: Browser A sudah login
    A->>DB: token = "abc123" disimpan di profiles

    Note over B,DB: Browser B mencoba login
    B->>DB: RPC check_active_session(email)
    DB-->>B: true (ada sesi aktif)
    B-->>B: ⚠️ Tampilkan dialog "Sesi Sedang Aktif"
    B-->>B: User klik "Mengerti" → batal

    Note over A: Jika Browser A logout
    A->>DB: current_session_token = NULL
    Note over B: Browser B bisa login bebas
```
