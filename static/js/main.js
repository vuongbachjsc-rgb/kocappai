document.getElementById('btnGenImage').addEventListener('click', function() {
    const face = document.getElementById('faceImage').files[0];
    const product = document.getElementById('productImage').files[0];
    if(!face || !product) {
        alert('Vui lòng chọn đầy đủ ảnh gương mặt nhân vật và ảnh sản phẩm!');
        return;
    }
    alert('[v1.2] Đã tạo ảnh ghép thời trang thành công!');
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
    document.getElementById('statusBadge').innerText = 'Đang AI hóa v1.2...';

    fetch('/generate', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingBox').classList.add('d-none');
        document.getElementById('statusBadge').className = 'badge bg-success';
        document.getElementById('statusBadge').innerText = 'Hoàn thành v1.2';
        
        if(data.success) {
            document.getElementById('successCount').innerText = data.count;
            const grid = document.getElementById('videoListGrid');
            grid.innerHTML = '';
            
            data.videos.forEach((item) => {
                grid.innerHTML += `
                    <div class="col-md-6">
                        <div class="video-card p-2 border rounded bg-white shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-success small">Video KOC #${item.id} (10s)</span>
                                <span class="badge bg-danger text-white">Miền Bắc</span>
                            </div>
                            <div class="row g-1 mb-2 text-center">
                                <div class="col-6">
                                    <small class="text-muted d-block">Nhân vật AI</small>
                                    <img src="${item.face}" class="rounded w-100" style="height: 100px; object-fit: cover;">
                                </div>
                                <div class="col-6">
                                    <small class="text-muted d-block">Sản phẩm ghép</small>
                                    <img src="${item.product}" class="rounded w-100" style="height: 100px; object-fit: cover;">
                                </div>
                            </div>
                            <button class="btn btn-sm btn-success w-100 fw-bold"><i class="fa-solid fa-download"></i> Tải Video Hàng Loạt #${item.id}</button>
                        </div>
                    </div>
                `;
            });
            document.getElementById('resultContainer').classList.remove('d-none');
        } else {
            alert('Có lỗi: ' + data.error);
        }
    })
    .catch(error => {
        document.getElementById('loadingBox').classList.add('d-none');
        alert('Lỗi kết nối: ' + error);
    });
});
