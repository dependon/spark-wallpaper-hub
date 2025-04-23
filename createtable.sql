-- 创建壁纸数据表
CREATE TABLE IF NOT EXISTS videoData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    author TEXT,
    fileName TEXT,
    downloadCount INTEGER DEFAULT 0,
    fileSize INTEGER,
    width INTEGER,
    height INTEGER,
    picture BLOB,
    downloadPath TEXT
);