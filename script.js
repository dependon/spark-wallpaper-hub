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