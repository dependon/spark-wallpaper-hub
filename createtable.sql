CREATE TABLE IF NOT EXISTS "videoData" (
	"md5"	CHAR(32) NOT NULL,
	"name"	VARCHAR(255) NOT NULL,
	"description"	TEXT,
	"category"	VARCHAR(100),
	"author"	VARCHAR(100),
	"fileName"	TEXT,
	"downloadPath"	VARCHAR(255),
	"downloadCount"	INTEGER,
	"fileSize"	INTEGER,
	"width"	INTEGER,
	"height"	INTEGER,
	"picture"	Blob,
    PRIMARY KEY (md5)
);