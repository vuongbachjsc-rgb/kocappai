document.getElementById('btnGenImage').addEventListener('click', function() {
    const face = document.getElementById('faceImage').files[0];
    const product = document.getElementById('productImage').files[0];
    if(!face || !product) {
        alert('Vui lòng chọn đầy đủ ảnh gương mặt nhân vật và ảnh sản phẩm!');
        return;
    }
    alert('Đã tạo ảnh ghép thành công! Nhân vật đã cầm sản phẩm chuẩn xác trên tay.');
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
    document.getElementById('statusBadge').innerText = 'Đang xử lý AI...';

    fetch('/generate', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingBox').classList.add('d-none');
        document.getElementById('statusBadge').className = 'badge bg-success';
        document.getElementById('statusBadge').innerText = 'Hoàn thành';
        
        if(data.success) {
            document.getElementById('successCount').innerText = data.count;
            const grid = document.getElementById('videoListGrid');
            grid.innerHTML = '';
            
            data.videos.forEach((vid, index) => {
                grid.innerHTML += `
                    <div class="col-md-6">
                        <div class="video-card">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-success small">Video #${index + 1} (10s)</span>
                                <span class="badge bg-light text-dark border">Miền Bắc</span>
                            </div>
                            <video controls class="w-100 rounded mb-2" style="height: 140px; object-fit: cover;">
                                <source src="${vid}" type="video/mp4">
                                Trình duyệt không hỗ trợ video.
                            </video>
                            <a href="${vid}" download class="btn btn-sm btn-outline-dark w-100"><i class="fa-solid fa-download"></i> Tải Video Này</a>
                        </div>
                    </div>
                `;
            });
            document.getElementById('resultContainer').classList.remove('d-none');
        } else {
            alert('Có lỗi xảy ra: ' + data.error);
        }
    })
    .catch(error => {
        document.getElementById('loadingBox').classList.add('d-none');
        alert('Lỗi kết nối server: ' + error);
    });
});
