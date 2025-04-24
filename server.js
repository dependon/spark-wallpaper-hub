const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000; // You can choose a different port if needed

// Database connection
const dbPath = path.resolve(__dirname, 'videoServer.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// API endpoint to get unique categories
app.get('/api/categories', (req, res) => {
    const sql = `SELECT DISTINCT category FROM videoData WHERE category IS NOT NULL AND category != '' ORDER BY category`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error querying categories:', err.message);
            return res.status(500).json({ error: 'Internal server error getting categories' });
        }
        const categories = rows.map(row => row.category);
        res.json(categories);
    });
});

// API endpoint to get single wallpaper details
app.get('/api/wallpapers/:name', (req, res) => {
    const name = req.params.name;
    const sql = `SELECT name, description, category, author, fileName, downloadPath, downloadCount, fileSize, width, height, picture FROM videoData WHERE name = ?`;
    
    db.get(sql, [name], (err, row) => {
        if (err) {
            console.error('Error querying wallpaper details:', err.message);
            return res.status(500).json({ error: 'Internal server error getting wallpaper details' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Wallpaper not found' });
        }

        // Convert Blob picture to Base64
        let pictureBase64 = null;
        if (row.picture && Buffer.isBuffer(row.picture)) {
            pictureBase64 = `data:image/jpeg;base64,${row.picture.toString('base64')}`;
        }

        const wallpaperDetails = {
            ...row,
            picture: pictureBase64
        };

        res.json(wallpaperDetails);
    });
});

// API endpoint to get wallpapers with pagination, filtering, and search
app.get('/api/wallpapers', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default limit to 20
    const offset = (page - 1) * limit;

    const category = req.query.category;
    const search = req.query.search;

    let whereClauses = [];
    let params = [];
    let countParams = [];

    if (category && category !== '全部') { // Assuming '全部' means no category filter
        whereClauses.push("category = ?");
        params.push(category);
        countParams.push(category);
    }

    if (search) {
        const searchTerm = `%${search}%`;
        whereClauses.push("(name LIKE ? OR description LIKE ? OR author LIKE ?)");
        params.push(searchTerm, searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM videoData ${whereSql}`;
    const dataSql = `SELECT name, picture FROM videoData ${whereSql} LIMIT ? OFFSET ?`;

    // Add limit and offset to data query params
    params.push(limit, offset);

    // First, get the total count
    db.get(countSql, countParams, (err, countRow) => {
        if (err) {
            console.error('Error querying total count:', err.message);
            return res.status(500).json({ error: 'Internal server error getting count' });
        }

        const totalWallpapers = countRow.total;

        // Then, get the paginated data
        db.all(dataSql, params, (err, rows) => {
            if (err) {
                console.error('Error querying paginated data:', err.message);
                return res.status(500).json({ error: 'Internal server error getting data' });
            }

            // Convert Blob picture to Base64
            const wallpapers = rows.map(row => {
                let pictureBase64 = null;
                if (row.picture && Buffer.isBuffer(row.picture)) {
                    pictureBase64 = `data:image/jpeg;base64,${row.picture.toString('base64')}`;
                }
                return {
                    name: row.name,
                    picture: pictureBase64
                };
            });

            res.json({
                wallpapers: wallpapers,
                total: totalWallpapers,
                page: page,
                limit: limit
            });
        });
    });
});

// Serve static files (index.html, script.js, style.css)
app.use(express.static(path.resolve(__dirname)));

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});