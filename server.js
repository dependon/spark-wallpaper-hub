app.get('/api/wallpapers', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Default limit to 50
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