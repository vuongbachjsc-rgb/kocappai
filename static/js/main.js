document.getElementById('btnGenImage').addEventListener('click', function() {
    const face = document.getElementById('faceImage').files[0];
    const product = document.getElementById('productImage').files[0];
    if(!face || !product) {
        alert('Vui lòng chọn đầy đủ ảnh gương mặt nhân vật và ảnh sản phẩm!');
        return;
    }
    alert('[v2.0] Đã nhận diện ảnh! Hãy bấm nút "Bước 3: Tạo Video Hàng Loạt" bên dưới để xuất video MP4.');
});

document.getElementById('aiForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const face = document.getElementById('faceImage').files[0];
    const product = document.getElementById('productImage').files[0];
    if(!face || !product) {
        alert('Vui lòng tải lên ảnh nhân vật và sản phẩm trước khi tạo video!');
        return;
    }

    const formData = new FormData(this);
    
    document.getElementById('resultPlaceholder').classList.add('d-none');
    document.getElementById('resultContainer').classList.add('d-none');
    document.getElementById('loadingBox').classList.remove('d-none');
    document.getElementById('statusBadge').className = 'badge bg-warning text-dark';
    document.getElementById('statusBadge').innerText = 'Đang dựng MP4 (v2.0)...';

    fetch('/generate', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingBox').classList.add('d-none');
        document.getElementById('statusBadge').className = 'badge bg-success';
        document.getElementById('statusBadge').innerText = 'Hoàn thành ' + (data.version || 'v2.0');
        
        if(data.success) {
            document.getElementById('successCount').innerText = data.count;
            const grid = document.getElementById('videoListGrid');
            grid.innerHTML = '';
            
            data.videos.forEach((item, idx) => {
                const vidId = item.id || (idx + 1);
                const voiceLabel = item.voice_label || 'Miền Bắc';
                const videoSrc = item.video_url || item;
                
                grid.innerHTML += `
                    <div class="col-md-6">
                        <div class="video-card p-2 border rounded bg-white shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-success small">Video KOC #${vidId}</span>
                                <span class="badge bg-danger text-white">${voiceLabel}</span>
                            </div>
                            <video controls class="w-100 rounded mb-2" style="height: 220px; object-fit: contain; background: #000;">
                                <source src="${videoSrc}" type="video/mp4">
                                Trình duyệt không hỗ trợ video.
                            </video>
                            <a href="${videoSrc}" download="koc_video_${vidId}.mp4" class="btn btn-sm btn-success w-100 fw-bold">
                                <i class="fa-solid fa-download"></i> Tải Video #${vidId} (.mp4)
                            </a>
                        </div>
                    </div>
                `;
            });
            document.getElementById('resultContainer').classList.remove('d-none');
        } else {
            alert('Có lỗi xử lý: ' + data.error);
        }
    })
    .catch(error => {
        document.getElementById('loadingBox').classList.add('d-none');
        alert('Lỗi kết nối server: ' + error);
    });
});
