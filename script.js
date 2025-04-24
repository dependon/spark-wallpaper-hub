// 翻译对象，存储中英文文本
const translations = {
    'zh': {
        'title': '星火动态壁纸下载页面',
        'home': '首页',
        'search_placeholder': '搜索壁纸...',
        'search_button': '搜索',
        'all_categories': '全部',
        'no_wallpapers': '没有找到壁纸。',
        'loading_error': '加载壁纸失败，请稍后再试。',
        'prev_page': '上一页',
        'next_page': '下一页',
        'page_info': '第 {current} 页 / 共 {total} 页',
        'go_to_page': '跳转',
        'page_input_aria': '跳转到页码',
        'page_error': '请输入 1 到 {total} 之间的页码',
        'description': '描述：{value}',
        'category': '类型：{value}',
        'author': '作者：{value}',
        'file_name': '文件名：{value}',
        'download_count': '下载次数：{value}',
        'file_size': '文件大小：{value}',
        'dimensions': '尺寸：{value}',
        'download_button': '下载壁纸',
        'details_error': '获取壁纸详情失败，请稍后再试。',
        'unknown': '未知',
        'untitled': '无标题',
        'none': '无'
    },
    'en': {
        'title': 'Spark Dynamic Wallpaper Download Page',
        'home': 'Home',
        'search_placeholder': 'Search wallpapers...',
        'search_button': 'Search',
        'all_categories': 'All',
        'no_wallpapers': 'No wallpapers found.',
        'loading_error': 'Failed to load wallpapers. Please try again later.',
        'prev_page': 'Previous',
        'next_page': 'Next',
        'page_info': 'Page {current} of {total}',
        'go_to_page': 'Go',
        'page_input_aria': 'Go to page',
        'page_error': 'Please enter a page number between 1 and {total}',
        'description': 'Description: {value}',
        'category': 'Category: {value}',
        'author': 'Author: {value}',
        'file_name': 'File name: {value}',
        'download_count': 'Downloads: {value}',
        'file_size': 'File size: {value}',
        'dimensions': 'Dimensions: {value}',
        'download_button': 'Download Wallpaper',
        'details_error': 'Failed to get wallpaper details. Please try again later.',
        'unknown': 'Unknown',
        'untitled': 'Untitled',
        'none': 'None'
    }
};

// 当前语言，默认为中文
let currentLang = 'zh';

// 当前主题，默认为亮色模式
let currentTheme = 'light';

// 格式化文件大小的辅助函数
function formatFileSize(bytes) {
    if (!bytes) return getText('unknown');
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < sizes.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${sizes[i]}`;
}

// 获取翻译文本的函数
function getText(key, replacements = {}) {
    let text = translations[currentLang][key] || key;
    
    // 替换占位符
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(`{${placeholder}}`, value);
    }
    
    return text;
}

// 切换语言的函数
function switchLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', currentLang);
    updatePageLanguage();
}

// 切换主题的函数
function switchTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    updatePageTheme();
}

// 更新页面语言
function updatePageLanguage() {
    // 更新HTML lang属性
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    
    // 更新标题
    document.title = getText('title');
    
    // 更新所有带有data-translate属性的元素
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (element.tagName === 'INPUT' && element.getAttribute('placeholder') !== null) {
            element.placeholder = getText(key);
        } else {
            element.textContent = getText(key);
        }
    });
    
    // 更新语言切换按钮文本
    const langSwitchButton = document.getElementById('lang-switch-button');
    if (langSwitchButton) {
        langSwitchButton.textContent = currentLang === 'zh' ? 'English' : '中文';
    }
    
    // 更新主题切换按钮文本
    const themeSwitchButton = document.getElementById('theme-switch-button');
    if (themeSwitchButton) {
        themeSwitchButton.textContent = currentLang === 'zh' ? 
            (currentTheme === 'light' ? '夜间模式' : '日间模式') : 
            (currentTheme === 'light' ? 'Dark Mode' : 'Light Mode');
    }
    
    // 刷新壁纸和分页
    if (typeof fetchWallpapers === 'function' && typeof currentPage !== 'undefined') {
        fetchWallpapers(currentPage, currentCategory, currentSearch);
    }
}

// 更新页面主题
function updatePageTheme() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // 更新主题切换按钮文本
    const themeSwitchButton = document.getElementById('theme-switch-button');
    if (themeSwitchButton) {
        themeSwitchButton.textContent = currentLang === 'zh' ? 
            (currentTheme === 'light' ? '夜间模式' : '日间模式') : 
            (currentTheme === 'light' ? 'Dark Mode' : 'Light Mode');
    }
}

// 根据IP检测用户位置并设置默认语言
async function detectUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // 如果用户在中国，使用中文，否则使用英文
        if (data.country === 'CN') {
            currentLang = 'zh';
        } else {
            currentLang = 'en';
        }
        
        // 更新页面语言
        updatePageLanguage();
    } catch (error) {
        console.error('Error detecting user location:', error);
        // 出错时使用浏览器语言或默认语言
        const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
        currentLang = browserLang;
        updatePageLanguage();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 从本地存储中获取语言和主题设置
    const savedLang = localStorage.getItem('language');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedLang) {
        currentLang = savedLang;
    } else {
        // 如果没有保存的语言设置，则检测用户位置
        detectUserLocation();
    }
    
    if (savedTheme) {
        currentTheme = savedTheme;
        updatePageTheme();
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div class="wallpaper-details">
                <div class="wallpaper-preview">
                    <img src="" alt="">
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
                    <a href="#" class="download-button" download></a>
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

    // 创建主题切换按钮
    const themeSwitchButton = document.createElement('button');
    themeSwitchButton.id = 'theme-switch-button';
    themeSwitchButton.textContent = currentLang === 'zh' ? '夜间模式' : 'Dark Mode';
    themeSwitchButton.style.marginLeft = '10px';
    themeSwitchButton.addEventListener('click', switchTheme);
    
    // 获取语言切换按钮
    const langSwitchButton = document.getElementById('lang-switch-button');
    if (langSwitchButton) {
        langSwitchButton.textContent = currentLang === 'zh' ? 'English' : '中文';
        langSwitchButton.addEventListener('click', switchLanguage);
    }
    
    // 将主题切换按钮添加到搜索容器中
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.appendChild(themeSwitchButton);
    }

    const categoryNavUl = document.querySelector('.category-nav ul'); // Select the category list
    const searchInput = document.getElementById('search-input'); // Assuming an ID 'search-input'
    const searchButton = document.getElementById('search-button'); // Assuming an ID 'search-button'
    const wallpaperGrid = document.querySelector('.wallpaper-grid');
    
    // 初始化页面语言
    updatePageLanguage();
const paginationContainer = document.createElement('div'); // Create pagination container
paginationContainer.id = 'pagination-controls';
document.body.appendChild(paginationContainer); // Append it to the body or a specific location

let currentPage = 1;
const limit = 20; // 每页显示数量改为20
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
    if (category && category !== getText('all_categories')) {
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
            wallpaperGrid.innerHTML = `<p>${getText('loading_error')}</p>`; // Display error message
            paginationContainer.innerHTML = ''; // Clear pagination on error
        });
}

// Function to display wallpapers in the grid
function displayWallpapers(wallpapers) {
    wallpaperGrid.innerHTML = ''; // Clear existing placeholders or error messages

    if (!wallpapers || wallpapers.length === 0) {
        wallpaperGrid.innerHTML = `<p>${getText('no_wallpapers')}</p>`;
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
        img.alt = wallpaper.name || getText('untitled'); // Use name as alt text, fallback
        img.onerror = () => { img.src = 'placeholder.jpg'; }; // Fallback on error

        const title = document.createElement('p');
        title.textContent = wallpaper.name || getText('untitled'); // Use name as title, fallback

        // 添加单击事件监听器
        item.addEventListener('click', () => {
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
                    modal.querySelector('.description').textContent = getText('description', {value: details.description || getText('none')});
                    modal.querySelector('.category').textContent = getText('category', {value: details.category || getText('none')});
                    modal.querySelector('.author').textContent = getText('author', {value: details.author || getText('none')});
                    modal.querySelector('.fileName').textContent = getText('file_name', {value: details.fileName || getText('none')});
                    modal.querySelector('.downloadCount').textContent = getText('download_count', {value: details.downloadCount || 0});
                    modal.querySelector('.fileSize').textContent = getText('file_size', {value: formatFileSize(details.fileSize)});
                    modal.querySelector('.dimensions').textContent = getText('dimensions', {value: `${details.width || 0} x ${details.height || 0}`});

                    // 更新下载按钮
                    const downloadButton = modal.querySelector('.download-button');
                    downloadButton.textContent = getText('download_button');
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
                    alert(getText('details_error'));
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
            prevButton.textContent = getText('prev_page');
            prevButton.onclick = () => fetchWallpapers(currentPage - 1);
            paginationContainer.appendChild(prevButton);
        }

        // Page Info Span
        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` ${getText('page_info', {current: currentPage, total: totalPages})} `;
        pageInfo.style.margin = '0 10px'; // Add some spacing
        paginationContainer.appendChild(pageInfo);

        // Next Button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = getText('next_page');
            nextButton.onclick = () => fetchWallpapers(currentPage + 1);
            paginationContainer.appendChild(nextButton);
        }

        // Manual Page Input
        const pageInputContainer = document.createElement('span');
        pageInputContainer.style.marginLeft = '20px'; // Add some space

        const pageInput = document.createElement('input');
        pageInput.type = 'number';
        pageInput.min = '1';
        pageInput.max = totalPages;
        pageInput.value = currentPage;
        pageInput.style.width = '50px';
        pageInput.style.marginRight = '5px';
        pageInput.setAttribute('aria-label', getText('page_input_aria'));

        const goToButton = document.createElement('button');
        goToButton.textContent = getText('go_to_page');
        goToButton.onclick = () => {
            const pageNum = parseInt(pageInput.value);
            if (pageNum >= 1 && pageNum <= totalPages) {
                fetchWallpapers(pageNum);
            } else {
                alert(getText('page_error', {total: totalPages}));
            }
        };
        // Add keydown listener for Enter key
        pageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                 goToButton.click(); // Trigger button click on Enter
            }
        });

        pageInputContainer.appendChild(pageInput);
        pageInputContainer.appendChild(goToButton);
        paginationContainer.appendChild(pageInputContainer);
    }

    // Function to fetch and display categories
    function fetchAndDisplayCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                if (!categoryNavUl) return;
                categoryNavUl.innerHTML = ''; // Clear static categories

                // Add 'All' category first
                const allLi = document.createElement('li');
                const allLink = document.createElement('a');
                allLink.href = '#';
                allLink.textContent = getText('all_categories');
                allLink.dataset.category = getText('all_categories'); // Use data attribute
                if (currentCategory === getText('all_categories')) {
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

    // 添加暗色主题的CSS样式
    const darkThemeStyle = document.createElement('style');
    darkThemeStyle.textContent = `
        .dark-theme {
            background-color: #121212;
            color: #e0e0e0;
        }
        .dark-theme header {
            background-color: #1e1e1e;
            border-bottom: 1px solid #333;
        }
        .dark-theme .main-nav a, .dark-theme .category-nav a {
            color: #e0e0e0;
        }
        .dark-theme .main-nav a.active, .dark-theme .category-nav a.active {
            border-bottom: 2px solid #4a9eff;
        }
        .dark-theme .search-container input {
            background-color: #2d2d2d;
            color: #e0e0e0;
            border: 1px solid #444;
        }
        .dark-theme .search-container button,
        .dark-theme .filter-options button,
        .dark-theme #pagination-controls button {
            background-color: #333;
            color: #e0e0e0;
            border: 1px solid #555;
        }
        .dark-theme .category-nav {
            background-color: #1e1e1e;
        }
        .dark-theme .wallpaper-item {
            background-color: #2d2d2d;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .dark-theme .wallpaper-item p {
            color: #e0e0e0;
        }
        .dark-theme .modal-content {
            background-color: #2d2d2d;
            color: #e0e0e0;
        }
        .dark-theme .close-button {
            color: #e0e0e0;
        }
        .dark-theme .wallpaper-info h2 {
            color: #e0e0e0;
        }
        .dark-theme .info-item {
            color: #bbb;
        }
        .dark-theme #pagination-controls input {
            background-color: #2d2d2d;
            color: #e0e0e0;
            border: 1px solid #444;
        }
    `;
    document.head.appendChild(darkThemeStyle);

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
            fetchWallpapers(1, getText('all_categories'), searchTerm); // Search across all categories
            // Optionally reset category selection visually
            const currentActive = categoryNavUl.querySelector('a.active');
             if (currentActive) {
                 currentActive.classList.remove('active');
             }
             const allLink = categoryNavUl.querySelector(`a[data-category="${getText('all_categories')}"]`);
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