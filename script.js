// 格式化文件大小的辅助函数
function formatFileSize(bytes) {
    if (!bytes) return '未知';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < sizes.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${sizes[i]}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // 创建模态框
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div class="wallpaper-details">
                <div class="wallpaper-preview">
                    <img src="" alt="壁纸预览">
                </div>
                <div class="wallpaper-info">
                    <h2></h2>
                    <div class="info-item description"></div>
                    <div class="info-item category"></div>
                    <div class="info-item author"></div>
                    <div class="info-item fileName"></div>
                    <div class="info-item downloadCount"></div>
                    <div class="info-item fileSize"></div>
                    <div class="info-item dimensions"></div>
                    <a href="#" class="download-button" download>下载壁纸</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 关闭模态框的点击事件
    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    const categoryNavUl = document.querySelector('.category-nav ul'); // Select the category list
    const searchInput = document.getElementById('search-input'); // Assuming an ID 'search-input'
    const searchButton = document.getElementById('search-button'); // Assuming an ID 'search-button'
    const wallpaperGrid = document.querySelector('.wallpaper-grid');
const paginationContainer = document.createElement('div'); // Create pagination container
paginationContainer.id = 'pagination-controls';
document.body.appendChild(paginationContainer); // Append it to the body or a specific location

let currentPage = 1;
const limit = 50;
let currentCategory = '全部'; // Default category
let currentSearch = ''; // Default search term

// Function to fetch wallpapers from the backend with pagination, category, and search
function fetchWallpapers(page = 1, category = currentCategory, search = currentSearch) {
    currentPage = page;
    currentCategory = category;
    currentSearch = search;

    // Build the query string
    const params = new URLSearchParams({
        page: page,
        limit: limit
    });
    if (category && category !== '全部') {
        params.append('category', category);
    }
    if (search) {
        params.append('search', search);
    }

    fetch(`/api/wallpapers?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWallpapers(data.wallpapers); // Display the wallpapers array
            setupPagination(data.total, data.page, data.limit); // Setup pagination controls
        })
        .catch(error => {
            console.error('Error fetching wallpapers:', error);
            wallpaperGrid.innerHTML = '<p>加载壁纸失败，请稍后再试。</p>'; // Display error message
            paginationContainer.innerHTML = ''; // Clear pagination on error
        });
}

// Function to display wallpapers in the grid
    function displayWallpapers(wallpapers) {
        wallpaperGrid.innerHTML = ''; // Clear existing placeholders or error messages

        if (!wallpapers || wallpapers.length === 0) {
            wallpaperGrid.innerHTML = '<p>没有找到壁纸。</p>';
            return;
        }

        wallpapers.forEach(wallpaper => {
            const item = document.createElement('div');
            item.classList.add('wallpaper-item');

            const img = document.createElement('img');
            // Assuming 'picture' is base64 encoded or a direct URL/path
            // If it's raw binary, the backend needs to convert it to base64 or serve it via a separate URL
            // Example assuming base64 data: `data:image/jpeg;base64,${wallpaper.picture}`
            // Example assuming a direct URL/path provided by the backend: `${wallpaper.picture}`
            // We'll assume the backend provides a usable image source URL or base64 string in the 'picture' field
            
            let imageSrc = 'placeholder.jpg'; // Default placeholder
            if (wallpaper.picture) {
                // Basic check if it looks like base64 data
                if (wallpaper.picture.startsWith('data:image')) {
                    imageSrc = wallpaper.picture;
                } else if (wallpaper.picture.startsWith('iVBORw0KGgo') || wallpaper.picture.startsWith('/9j/')) { // PNG or JPG base64 common prefixes
                     // Attempt to guess image type based on base64 prefix, default to jpeg
                    const imageType = wallpaper.picture.startsWith('iVBORw0KGgo') ? 'png' : 'jpeg'; 
                    imageSrc = `data:image/${imageType};base64,${wallpaper.picture}`;
                } else {
                    // Assume it's a relative or absolute URL path
                    imageSrc = wallpaper.picture; 
                }
            }
            
            img.src = imageSrc;
            img.alt = wallpaper.name || '壁纸'; // Use name as alt text, fallback to '壁纸'
            img.onerror = () => { img.src = 'placeholder.jpg'; }; // Fallback on error

            const title = document.createElement('p');
            title.textContent = wallpaper.name || '无标题'; // Use name as title, fallback

            // 添加双击事件监听器
            item.addEventListener('dblclick', () => {
                fetch(`/api/wallpapers/${encodeURIComponent(wallpaper.name)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(details => {
                        // 更新模态框内容
                        const modalImg = modal.querySelector('.wallpaper-preview img');
                        modalImg.src = details.picture || 'placeholder.jpg';
                        modalImg.alt = details.name;

                        modal.querySelector('.wallpaper-info h2').textContent = details.name;
                        modal.querySelector('.description').textContent = `描述：${details.description || '无'}`;
                        modal.querySelector('.category').textContent = `类型：${details.category || '无'}`;
                        modal.querySelector('.author').textContent = `作者：${details.author || '无'}`;
                        modal.querySelector('.fileName').textContent = `文件名：${details.fileName || '无'}`;
                        modal.querySelector('.downloadCount').textContent = `下载次数：${details.downloadCount || 0}`;
                        modal.querySelector('.fileSize').textContent = `文件大小：${formatFileSize(details.fileSize)}`;
                        modal.querySelector('.dimensions').textContent = `尺寸：${details.width || 0} x ${details.height || 0}`;

                        // 更新下载按钮
                        const downloadButton = modal.querySelector('.download-button');
                        if (details.downloadPath) {
                            downloadButton.href = details.downloadPath;
                            downloadButton.style.display = 'inline-block';
                        } else {
                            downloadButton.style.display = 'none';
                        }

                        // 显示模态框
                        modal.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error fetching wallpaper details:', error);
                        alert('获取壁纸详情失败，请稍后再试。');
                    });
            });

            item.appendChild(img);
            item.appendChild(title);
            wallpaperGrid.appendChild(item);
        });
    }

    // Function to set up pagination controls
    function setupPagination(totalItems, currentPage, itemsPerPage) {
        paginationContainer.innerHTML = ''; // Clear previous controls
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return; // No pagination needed for one page or less

        // Previous Button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '上一页';
            prevButton.onclick = () => fetchWallpapers(currentPage - 1);
            paginationContainer.appendChild(prevButton);
        }

        // Page Numbers (simplified example: show current page and total pages)
        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` 第 ${currentPage} 页 / 共 ${totalPages} 页 `;
        pageInfo.style.margin = '0 10px'; // Add some spacing
        paginationContainer.appendChild(pageInfo);

        // Next Button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '下一页';
            nextButton.onclick = () => fetchWallpapers(currentPage + 1);
            paginationContainer.appendChild(nextButton);
        }
    }

    // Function to fetch and display categories
    function fetchAndDisplayCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                if (!categoryNavUl) return;
                categoryNavUl.innerHTML = ''; // Clear static categories

                // Add '全部' category first
                const allLi = document.createElement('li');
                const allLink = document.createElement('a');
                allLink.href = '#';
                allLink.textContent = '全部';
                allLink.dataset.category = '全部'; // Use data attribute
                if (currentCategory === '全部') {
                    allLink.classList.add('active');
                }
                allLi.appendChild(allLink);
                categoryNavUl.appendChild(allLi);

                // Add fetched categories
                categories.forEach(category => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = '#';
                    link.textContent = category;
                    link.dataset.category = category; // Use data attribute
                    if (currentCategory === category) {
                        link.classList.add('active');
                    }
                    li.appendChild(link);
                    categoryNavUl.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    // Add event listener for category clicks (using event delegation)
    if (categoryNavUl) {
        categoryNavUl.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                event.preventDefault();
                const selectedCategory = event.target.dataset.category;
                if (selectedCategory !== currentCategory) {
                    // Remove active class from previous link
                    const currentActive = categoryNavUl.querySelector('a.active');
                    if (currentActive) {
                        currentActive.classList.remove('active');
                    }
                    // Add active class to clicked link
                    event.target.classList.add('active');
                    // Fetch wallpapers for the new category
                    fetchWallpapers(1, selectedCategory, ''); // Reset search when changing category
                }
            }
        });
    }

    // Add event listener for search button click
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            fetchWallpapers(1, '全部', searchTerm); // Search across all categories
            // Optionally reset category selection visually
            const currentActive = categoryNavUl.querySelector('a.active');
             if (currentActive) {
                 currentActive.classList.remove('active');
             }
             const allLink = categoryNavUl.querySelector('a[data-category="全部"]');
             if (allLink) {
                 allLink.classList.add('active');
             }
        });
    }

    // Add event listener for Enter key in search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission if it's inside a form
                searchButton.click(); // Trigger search button click
            }
        });
    }

    // Initial fetch when the page loads
    fetchAndDisplayCategories(); // Load categories first
    fetchWallpapers(currentPage); // Then load initial wallpapers
});

console.log('Script loaded and initialized.');