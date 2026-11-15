import os
import base64
import tempfile
from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw
from moviepy.editor import ImageClip

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

APP_VERSION = "v2.0"

@app.route('/')
def index():
    return render_template('index.html', version=APP_VERSION)

def create_koc_video(face_stream, prod_stream, duration=5):
    # Mở và chuẩn hóa kích thước ảnh nhân vật & sản phẩm
    face_img = Image.open(face_stream).convert("RGB").resize((360, 640))
    prod_img = Image.open(prod_stream).convert("RGB").resize((180, 180))
    
    # Ghép ảnh sản phẩm vào góc dưới bên phải của nhân vật (như KOC đang giới thiệu)
    combined = face_img.copy()
    
    # Tạo viền trắng nổi bật cho khung sản phẩm
    border = Image.new("RGB", (190, 190), (255, 255, 255))
    combined.paste(border, (155, 435))
    combined.paste(prod_img, (160, 440))
    
    # Lưu khung hình tạm và render thành video MP4
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_img:
        combined.save(tmp_img.name, quality=90)
        tmp_img_path = tmp_img.name
        
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_vid:
        tmp_vid_path = tmp_vid.name

    try:
        # Tạo video từ ảnh ghép (đặt 5 giây để tốc độ xử lý trên Free Host nhanh nhất)
        clip = ImageClip(tmp_img_path).set_duration(duration)
        clip.write_videofile(
            tmp_vid_path,
            fps=12,
            codec="libx264",
            audio=False,
            preset="ultrafast",
            logger=None
        )
        clip.close()
        
        with open(tmp_vid_path, "rb") as f:
            vid_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        with open(tmp_img_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        return f"data:video/mp4;base64,{vid_b64}", f"data:image/jpeg;base64,{img_b64}"
    finally:
        if os.path.exists(tmp_img_path):
            os.remove(tmp_img_path)
        if os.path.exists(tmp_vid_path):
            os.remove(tmp_vid_path)

@app.route('/generate', methods=['POST'])
def generate():
    try:
        face_file = request.files.get('faceImage')
        prod_file = request.files.get('productImage')
        batch_count = int(request.form.get('batch_count', 5))
        voice = request.form.get('voice', 'north')
        
        if not face_file or not prod_file:
            return jsonify({'success': False, 'error': 'Thiếu file hình ảnh đầu vào!'})
            
        voice_label = "Miền Bắc" if voice == "north" else ("Miền Nam" if voice == "south" else "Miền Trung")
        
        # Render video MP4 thực tế từ 2 ảnh người dùng tải lên
        video_data_uri, preview_img_uri = create_koc_video(face_file.stream, prod_file.stream, duration=5)
        
        generated_results = []
        for i in range(min(batch_count, 10)):
            generated_results.append({
                'id': i + 1,
                'video_url': video_data_uri,
                'preview_img': preview_img_uri,
                'voice_label': voice_label
            })
            
        return jsonify({
            'success': True,
            'version': APP_VERSION,
            'count': batch_count,
            'videos': generated_results
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
